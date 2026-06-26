import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getMusicUploadDurationSeconds } from "@/lib/clipstitchr/server/music/getMusicUploadDurationSeconds";
import { getMusicUploadFile } from "@/lib/clipstitchr/server/music/getMusicUploadFile";
import { getMusicUploadSource } from "@/lib/clipstitchr/server/music/getMusicUploadSource";
import { getMusicUploadTitle } from "@/lib/clipstitchr/server/music/getMusicUploadTitle";
import { assertSoundRightsAccepted } from "@/lib/clipstitchr/server/music/assertSoundRightsAccepted";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { saveLibraryMusicObject } from "@/lib/clipstitchr/server/saveLibraryMusicObject";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const formData = await request.formData();
    const file = getMusicUploadFile(formData.get("file"));
    const source = getMusicUploadSource(formData.get("source"));
    const title = getMusicUploadTitle(formData.get("title"), file.name);
    const durationSeconds = getMusicUploadDurationSeconds(
      formData.get("durationSeconds"),
    );
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const id = createId();
    const createdAt = new Date().toISOString();
    const soundPreference = await convex.query(api.soundPreferences.get, {});

    assertSoundRightsAccepted(soundPreference);

    await convex.mutation(api.rateLimits.consumeR2Upload, {
      secret: getRateLimitApiSecret(),
      sizeBytes: file.size,
    });

    const audioObject = await saveLibraryMusicObject({
      body: await file.arrayBuffer(),
      contentType: file.type || "application/octet-stream",
      trackId: id,
      userId,
    });

    await convex.mutation(api.sharedMusicTracks.save, {
      id,
      title,
      tags: ["music", source],
      durationSeconds,
      audioObject,
      mimeType: audioObject.contentType,
      size: audioObject.size,
      source,
      createdAt,
    });

    const track = await convex.query(api.sharedMusicTracks.get, { id });

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "sound_uploaded",
      properties: {
        content_type: audioObject.contentType,
        size_bytes: audioObject.size,
        source,
      },
      request,
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
          error instanceof Error ? error.message : "Unable to upload sound.",
      },
      { status: 400 },
    );
  }
}
