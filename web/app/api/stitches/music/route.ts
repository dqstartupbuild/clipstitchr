import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { cliprMusicGenerationDefaults } from "@/lib/clipstitchr/constants/cliprMusicGenerationDefaults";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createStitchMusic } from "@/lib/clipstitchr/server/createStitchMusic";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { saveStitchMusicObject } from "@/lib/clipstitchr/server/saveStitchMusicObject";
import { saveSharedMusicObject } from "@/lib/clipstitchr/server/saveSharedMusicObject";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getGeneratedMusicTrackTags } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTags";
import { getGeneratedMusicTrackTitle } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTitle";

export const runtime = "nodejs";

type StitchMusicCreateRequest = {
  stitchId?: unknown;
};

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const body = (await request.json()) as StitchMusicCreateRequest;
    const stitchId =
      typeof body.stitchId === "string" ? body.stitchId.trim() : "";

    if (!stitchId) {
      throw new Error("Choose a stitch first.");
    }

    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();
    const stitch = await convex.query(api.stitches.get, { id: stitchId });

    if (!stitch) {
      throw new Error("Stitch not found.");
    }

    await convex.mutation(api.rateLimits.consumeStitchMusicGeneration, {
      generatedSeconds: cliprMusicGenerationDefaults.durationSeconds,
      secret,
    });

    const generatedMusic = await createStitchMusic({
      replicate: createReplicateClient(),
      stitch,
    });

    await convex.mutation(api.rateLimits.consumeR2Upload, {
      secret,
      sizeBytes: generatedMusic.body.byteLength * 2,
    });

    const trackId = createId();
    const title = getGeneratedMusicTrackTitle({
      source: "stitchr",
      style: stitch.name,
      trackId,
    });
    const tags = getGeneratedMusicTrackTags({
      includeStyleTags: false,
      source: "stitchr",
      style: stitch.name,
    });
    const [audioObject, sharedAudioObject] = await Promise.all([
      saveStitchMusicObject({
        body: generatedMusic.body,
        contentType: generatedMusic.contentType,
        stitchId: `${stitch.id}-${trackId}`,
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
      style: stitch.name,
      durationSeconds: generatedMusic.durationSeconds,
      audioObject: sharedAudioObject,
      ownerAudioObject: audioObject,
      mimeType: generatedMusic.contentType,
      size: generatedMusic.body.byteLength,
      prompt: generatedMusic.prompt,
      providerModel: generatedMusic.modelId,
      providerPredictionId: generatedMusic.predictionId,
      source: "stitchr",
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
            : "Unable to generate stitch music.",
      },
      { status: 500 },
    );
  }
}
