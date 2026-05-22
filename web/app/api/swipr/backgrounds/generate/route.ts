import { NextResponse } from "next/server";
import type { Prediction } from "replicate";
import { api } from "@/convex/_generated/api";
import { SWIPR_BACKGROUND_GENERATION_METADATA_HEADER_NAME } from "@/lib/clipstitchr/constants/swiprBackgroundGenerationMetadataHeaderName";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createSwiprBackgroundGenerationMetadataText } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationMetadataText";
import { createSwiprBackgroundGenerationInput } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationInput";
import { createSwiprBackgroundGenerationPrompt } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationPrompt";
import { createSwiprBackgroundVariation } from "@/lib/clipstitchr/server/createSwiprBackgroundVariation";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import { getSwiprBackgroundGenerationModelId } from "@/lib/clipstitchr/server/getSwiprBackgroundGenerationModelId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getSwiprBackgroundPresetId } from "@/lib/clipstitchr/utils/getSwiprBackgroundPresetId";

export const runtime = "nodejs";

type SwiprBackgroundGenerationRequest = {
  prompt?: unknown;
  productContext?: unknown;
  presetId?: unknown;
};

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const body = (await request.json()) as SwiprBackgroundGenerationRequest;
    const productContext =
      typeof body.productContext === "string" ? body.productContext : "";
    const userPrompt = typeof body.prompt === "string" ? body.prompt : "";
    const preferredPresetId =
      typeof body.presetId === "string"
        ? getSwiprBackgroundPresetId(body.presetId)
        : undefined;
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const rateLimitSecret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeSwiprBackgroundGenerate, {
      secret: rateLimitSecret,
    });

    const modelId = getSwiprBackgroundGenerationModelId();
    const variation = createSwiprBackgroundVariation({
      preferredPresetId,
      productContext,
    });
    const prompt = createSwiprBackgroundGenerationPrompt({
      modelId,
      productContext,
      presetId: variation.presetId,
      userPrompt,
      variation,
    });
    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.create({
      ...getReplicatePredictionModelReference(modelId),
      input: createSwiprBackgroundGenerationInput({
        modelId,
        prompt,
      }),
    });
    const completedPrediction = await replicate.wait(prediction, {
      interval: 2000,
    });

    if (completedPrediction.status !== "succeeded") {
      throw new Error(
        typeof completedPrediction.error === "string"
          ? completedPrediction.error
          : "Replicate did not complete Swipr background generation.",
      );
    }

    const outputUrl = getReplicateOutputUrl(
      (completedPrediction as Prediction).output,
    );
    const outputResponse = await fetchReplicateOutput(outputUrl);
    const headers = new Headers();
    const contentType = outputResponse.headers.get("content-type");
    const generationMetadata =
      createSwiprBackgroundGenerationMetadataText(variation, userPrompt);

    headers.set("content-type", contentType ?? "image/jpeg");
    headers.set(
      SWIPR_BACKGROUND_GENERATION_METADATA_HEADER_NAME,
      encodeURIComponent(generationMetadata),
    );

    return new NextResponse(outputResponse.body, { headers });
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
            : "Unable to generate this Swipr background.",
      },
      { status: 500 },
    );
  }
}
