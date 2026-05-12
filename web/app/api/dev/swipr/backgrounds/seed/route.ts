import { NextResponse } from "next/server";
import type { Prediction } from "replicate";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createSwiprBackgroundGenerationInput } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationInput";
import { createSwiprBackgroundSeedPlans } from "@/lib/clipstitchr/server/createSwiprBackgroundSeedPlans";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import { getSwiprBackgroundGenerationModelId } from "@/lib/clipstitchr/server/getSwiprBackgroundGenerationModelId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createSharedSwiprBackgroundR2ObjectKey } from "@/lib/clipstitchr/server/r2/createSharedSwiprBackgroundR2ObjectKey";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import { readImageDimensionsFromBytes } from "@/lib/clipstitchr/server/readImageDimensionsFromBytes";

export const runtime = "nodejs";

const DEFAULT_SEED_BATCH_SIZE = 5;
const MAX_SEED_BATCH_SIZE = 5;

type SwiprBackgroundSeedRequest = {
  count?: unknown;
};

function getSeedBatchSize(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_SEED_BATCH_SIZE;
  }

  return Math.max(1, Math.min(MAX_SEED_BATCH_SIZE, Math.floor(value)));
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const body = (await request.json().catch(() => ({}))) as
      | SwiprBackgroundSeedRequest
      | undefined;
    const count = getSeedBatchSize(body?.count);
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const existingBackgrounds = await convex.query(api.swiprBackgrounds.list, {});
    const existingBackgroundIds = new Set(
      existingBackgrounds.map((background) => background.id),
    );
    const seedPlans = createSwiprBackgroundSeedPlans();
    const pendingSeedPlans = seedPlans
      .filter((plan) => !existingBackgroundIds.has(plan.id))
      .slice(0, count);
    const modelId = getSwiprBackgroundGenerationModelId();
    const rateLimitSecret = getRateLimitApiSecret();
    const replicate = createReplicateClient();
    const savedIds: string[] = [];

    getR2Environment();

    for (const seedPlan of pendingSeedPlans) {
      await convex.mutation(api.rateLimits.consumeSwiprSeedBackgroundGenerateDev, {
        count: 1,
        secret: rateLimitSecret,
      });

      const prediction = await replicate.predictions.create({
        ...getReplicatePredictionModelReference(modelId),
        input: createSwiprBackgroundGenerationInput({
          modelId,
          prompt: seedPlan.prompt,
        }),
      });
      const completedPrediction = await replicate.wait(prediction, {
        interval: 2000,
      });

      if (completedPrediction.status !== "succeeded") {
        throw new Error(
          typeof completedPrediction.error === "string"
            ? completedPrediction.error
            : "Replicate did not complete Swipr seed background generation.",
        );
      }

      const outputUrl = getReplicateOutputUrl(
        (completedPrediction as Prediction).output,
      );
      const outputResponse = await fetchReplicateOutput(outputUrl);
      const contentType = outputResponse.headers.get("content-type") ?? "image/jpeg";
      const imageBytes = await outputResponse.arrayBuffer();
      const dimensions = readImageDimensionsFromBytes(imageBytes, contentType);

      await convex.mutation(api.rateLimits.consumeR2Upload, {
        secret: rateLimitSecret,
        sizeBytes: imageBytes.byteLength,
      });

      const imageObject = await putR2Object({
        body: imageBytes,
        contentType,
        key: createSharedSwiprBackgroundR2ObjectKey({
          recordId: seedPlan.id,
          contentType,
        }),
      });

      await convex.mutation(api.swiprBackgrounds.save, {
        id: seedPlan.id,
        name: seedPlan.name,
        tags: seedPlan.tags,
        description: seedPlan.description,
        details: seedPlan.details,
        source: "seed",
        imageObject,
        mimeType: imageObject.contentType,
        size: imageObject.size,
        width: dimensions.width,
        height: dimensions.height,
        createdAt: new Date().toISOString(),
      });

      savedIds.push(seedPlan.id);
      existingBackgroundIds.add(seedPlan.id);
    }

    const skipped = seedPlans.length - pendingSeedPlans.length -
      seedPlans.filter((plan) => !existingBackgroundIds.has(plan.id)).length;

    return NextResponse.json({
      total: seedPlans.length,
      requested: count,
      saved: savedIds.length,
      skipped,
      remaining: seedPlans.filter((plan) => !existingBackgroundIds.has(plan.id))
        .length,
      savedIds,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to seed Swipr backgrounds.",
      },
      { status: 500 },
    );
  }
}
