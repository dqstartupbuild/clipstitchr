import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { SWIPR_BACKGROUND_GENERATION_METADATA_HEADER_NAME } from "@/lib/clipstitchr/constants/swiprBackgroundGenerationMetadataHeaderName";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createSwiprBackgroundGenerationMetadataText } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationMetadataText";
import { createSwiprBackgroundGenerationPrompt } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationPrompt";
import { createSwiprBackgroundVariation } from "@/lib/clipstitchr/server/createSwiprBackgroundVariation";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getSwiprBackgroundGenerationModelId } from "@/lib/clipstitchr/server/getSwiprBackgroundGenerationModelId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { deleteR2Object } from "@/lib/clipstitchr/server/r2/deleteR2Object";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { waitForProviderJob } from "@/lib/clipstitchr/server/waitForProviderJob";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getSwiprBackgroundPresetId } from "@/lib/clipstitchr/utils/getSwiprBackgroundPresetId";

export const runtime = "nodejs";

type SwiprBackgroundGenerationRequest = {
  presetId?: unknown;
  productContext?: unknown;
  prompt?: unknown;
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
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeSwiprBackgroundGenerate, {
      secret,
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
    const createdAt = new Date().toISOString();
    const outputRecordId = createId();
    const providerJobId = `provider:swipr-background:${outputRecordId}`;
    const reservation = await convex.mutation(
      api.usage.reserveCreationCredits.reserveCreationCredits,
      {
        domainId: providerJobId,
        domainKind: "provider_job",
        idempotencyKey: `background-photo:${userId}:${outputRecordId}`,
        now: createdAt,
        operation: "background_photo",
        reservationKind: "worker",
      },
    );

    try {
      await convex.mutation(api.providerJobs.create, {
        secret,
        ownerId: userId,
        id: providerJobId,
        jobType: "swipr-background-generation",
        stage: "awaiting-provider",
        idempotencyKey: `${userId}:swipr-background:${outputRecordId}`,
        inputSnapshotJson: JSON.stringify({ modelId, outputRecordId, prompt }),
        usageReservationId: reservation.reservationId ?? undefined,
        createdAt,
      });
    } catch (error) {
      if (reservation.reservationId) {
        await convex.mutation(
          api.usage.cancelUsageReservation.cancelUsageReservation,
          {
            now: new Date().toISOString(),
            reason: "Background photo job could not be queued",
            reservationId: reservation.reservationId,
          },
        );
      }
      throw error;
    }

    const job = await waitForProviderJob(convex, providerJobId);
    const outputKey = job.outputAssetIds[0];

    if (!outputKey) {
      throw new Error("The background finished without an image.");
    }

    await convex.mutation(api.rateLimits.consumeR2Download, { secret });
    const signed = await getR2DownloadSignedUrl(outputKey);
    const output = await fetch(signed.url);

    if (!output.ok) {
      throw new Error("Unable to download the finished background.");
    }

    const result = await output.arrayBuffer();
    const headers = new Headers({
      "content-type": output.headers.get("content-type") ?? "image/jpeg",
      [SWIPR_BACKGROUND_GENERATION_METADATA_HEADER_NAME]: encodeURIComponent(
        createSwiprBackgroundGenerationMetadataText(variation, userPrompt),
      ),
    });

    await deleteR2Object(outputKey).catch(() => null);

    return new NextResponse(result, { headers });
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
