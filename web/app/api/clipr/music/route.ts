import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { cliprMusicGenerationDefaults } from "@/lib/clipstitchr/constants/cliprMusicGenerationDefaults";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createCliprMusic } from "@/lib/clipstitchr/server/createCliprMusic";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { saveCliprMusicObject } from "@/lib/clipstitchr/server/saveCliprMusicObject";
import { saveSharedMusicObject } from "@/lib/clipstitchr/server/saveSharedMusicObject";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getGeneratedMusicTrackTags } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTags";
import { getGeneratedMusicTrackTitle } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTitle";

export const runtime = "nodejs";

type CliprMusicCreateRequest = {
  clipId?: unknown;
};

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const body = (await request.json()) as CliprMusicCreateRequest;
    const clipId = typeof body.clipId === "string" ? body.clipId.trim() : "";

    if (!clipId) {
      throw new Error("Choose a Clipr clip first.");
    }

    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();
    const clip = await convex.query(api.videoClips.get, { id: clipId });

    if (!clip?.cliprMetadata) {
      throw new Error("Clipr clip not found.");
    }

    await convex.mutation(api.rateLimits.consumeCliprMusicGeneration, {
      generatedSeconds: cliprMusicGenerationDefaults.durationSeconds,
      secret,
    });

    const productDocument = await convex.query(api.products.get, {
      id: clip.cliprMetadata.productId,
    });
    const product = productDocument
      ? createProductProfileFromConvexDocument(productDocument)
      : null;
    const generatedMusic = await createCliprMusic({
      audienceDetails: product?.audienceDetails ?? "",
      productName: product?.name ?? clip.cliprMetadata.productName,
      replicate: createReplicateClient(),
      script: clip.cliprMetadata.script,
    });

    await convex.mutation(api.rateLimits.consumeR2Upload, {
      secret,
      sizeBytes: generatedMusic.body.byteLength * 2,
    });

    const trackId = createId();
    const title = getGeneratedMusicTrackTitle({
      source: "clipr",
      style: product?.name ?? clip.cliprMetadata.productName,
    });
    const tags = getGeneratedMusicTrackTags({
      source: "clipr",
      style: product?.name ?? clip.cliprMetadata.productName,
    });
    const [audioObject, sharedAudioObject] = await Promise.all([
      saveCliprMusicObject({
        body: generatedMusic.body,
        contentType: generatedMusic.contentType,
        jobId: `${clip.cliprMetadata.jobId}-${trackId}`,
        userId,
      }),
      saveSharedMusicObject({
        body: generatedMusic.body,
        contentType: generatedMusic.contentType,
        trackId,
      }),
    ]);
    const now = new Date().toISOString();

    await convex.mutation(api.sharedMusicTracks.save, {
      id: trackId,
      title,
      tags,
      style: product?.name ?? clip.cliprMetadata.productName,
      durationSeconds: generatedMusic.durationSeconds,
      audioObject: sharedAudioObject,
      ownerAudioObject: audioObject,
      mimeType: generatedMusic.contentType,
      size: generatedMusic.body.byteLength,
      prompt: generatedMusic.prompt,
      providerModel: generatedMusic.modelId,
      providerPredictionId: generatedMusic.predictionId,
      source: "clipr",
      createdAt: now,
    });

    return NextResponse.json({
      music: {
        audioObject,
        createdAt: now,
        durationSeconds: generatedMusic.durationSeconds,
        enabled: true,
        prompt: generatedMusic.prompt,
        providerModel: generatedMusic.modelId,
        providerPredictionId: generatedMusic.predictionId,
        sharedTrackId: trackId,
        tags,
        title,
        updatedAt: now,
        volume: 1,
      },
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
            : "Unable to generate Clipr music.",
      },
      { status: 500 },
    );
  }
}
