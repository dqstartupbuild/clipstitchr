import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { cliprMusicGenerationDefaults } from "@/lib/clipstitchr/constants/cliprMusicGenerationDefaults";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createLibraryMusic } from "@/lib/clipstitchr/server/createLibraryMusic";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { saveLibraryMusicObject } from "@/lib/clipstitchr/server/saveLibraryMusicObject";
import { saveSharedMusicObject } from "@/lib/clipstitchr/server/saveSharedMusicObject";
import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getGeneratedMusicTrackTags } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTags";
import { getGeneratedMusicTrackTitle } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTitle";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";

export const runtime = "nodejs";

type MusicGenerateRequest = {
  source?: unknown;
  style?: unknown;
};

function getMusicTrackSource(value: unknown): MusicTrackSource {
  return value === "clipr" ||
    value === "stitchr" ||
    value === "longr" ||
    value === "swipr" ||
    value === "library"
    ? value
    : "library";
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const body = (await request.json()) as MusicGenerateRequest;
    const source = getMusicTrackSource(body.source);
    const style =
      typeof body.style === "string" ? body.style.trim().slice(0, 220) : "";
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeSharedMusicGeneration, {
      generatedSeconds: cliprMusicGenerationDefaults.durationSeconds,
      secret,
    });

    const generatedMusic = await createLibraryMusic({
      replicate: createReplicateClient(),
      style,
    });

    await convex.mutation(api.rateLimits.consumeR2Upload, {
      secret,
      sizeBytes: generatedMusic.body.byteLength * 2,
    });

    const trackId = createId();
    const [audioObject, ownerAudioObject] = await Promise.all([
      saveSharedMusicObject({
        body: generatedMusic.body,
        contentType: generatedMusic.contentType,
        trackId,
      }),
      saveLibraryMusicObject({
        body: generatedMusic.body,
        contentType: generatedMusic.contentType,
        trackId,
        userId,
      }),
    ]);
    const createdAt = new Date().toISOString();
    const title = getGeneratedMusicTrackTitle({ source, style, trackId });
    const tags = getGeneratedMusicTrackTags({ source, style });

    await convex.mutation(api.sharedMusicTracks.save, {
      id: trackId,
      title,
      tags,
      style: style || undefined,
      durationSeconds: generatedMusic.durationSeconds,
      audioObject,
      ownerAudioObject,
      mimeType: generatedMusic.contentType,
      size: generatedMusic.body.byteLength,
      prompt: generatedMusic.prompt,
      providerModel: generatedMusic.modelId,
      providerPredictionId: generatedMusic.predictionId,
      source,
      createdAt,
    });

    const track = await convex.query(api.sharedMusicTracks.get, { id: trackId });

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "library_music_generated",
      properties: {
        track_id: trackId,
        source,
        style: style || undefined,
        duration_seconds: generatedMusic.durationSeconds,
      },
      request,
    });

    return NextResponse.json({ track });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to generate music.",
      },
      { status: 500 },
    );
  }
}
