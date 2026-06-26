import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { assertSoundRightsAccepted } from "@/lib/clipstitchr/server/music/assertSoundRightsAccepted";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { fetchTikTokSoundAudio } from "@/lib/clipstitchr/server/tiktok/fetchTikTokSoundAudio";
import { readTikTokSoundImportRequest } from "@/lib/clipstitchr/server/tiktok/readTikTokSoundImportRequest";
import { runTikTokSoundUrlLookup } from "@/lib/clipstitchr/server/tiktok/runTikTokSoundUrlLookup";
import { saveLibraryMusicObject } from "@/lib/clipstitchr/server/saveLibraryMusicObject";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

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

    const input = await readTikTokSoundImportRequest(request);
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const soundPreference = await convex.query(api.soundPreferences.get, {});

    assertSoundRightsAccepted(soundPreference);
    await convex.mutation(api.rateLimits.consumeTikTokSoundLookup, {
      secret: getRateLimitApiSecret(),
    });
    await convex.mutation(api.rateLimits.consumeTikTokSoundImport, {
      secret: getRateLimitApiSecret(),
    });

    const candidate = await runTikTokSoundUrlLookup(input.sourceUrl);

    if (!candidate.playUrl) {
      throw new Error("That TikTok does not expose an importable sound.");
    }

    const audio = await fetchTikTokSoundAudio(candidate.playUrl);
    const trackId = createId();
    const createdAt = new Date().toISOString();

    await convex.mutation(api.rateLimits.consumeR2Upload, {
      secret: getRateLimitApiSecret(),
      sizeBytes: audio.body.byteLength,
    });

    const audioObject = await saveLibraryMusicObject({
      body: audio.body,
      contentType: audio.contentType,
      trackId,
      userId,
    });

    await convex.mutation(api.sharedMusicTracks.save, {
      id: trackId,
      title: candidate.author
        ? `${candidate.title} - ${candidate.author}`
        : candidate.title,
      tags: ["sound", "tiktok"],
      durationSeconds: candidate.durationSeconds ?? 15,
      audioObject,
      mimeType: audioObject.contentType,
      size: audioObject.size,
      prompt: candidate.videoText,
      providerModel: "clockworks/tiktok-scraper",
      providerPredictionId: candidate.musicId ?? trackId,
      source: "tiktok",
      sourceUrl: candidate.sourceUrl,
      tiktokMusicId: candidate.musicId,
      createdAt,
    });

    const track = await convex.query(api.sharedMusicTracks.get, {
      id: trackId,
    });

    return Response.json({ track });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to save that sound.",
      },
      { status: 400 },
    );
  }
}
