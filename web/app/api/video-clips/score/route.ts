import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createUploadVideoAnalysisOutputText } from "@/lib/clipstitchr/server/createUploadVideoAnalysisOutputText";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { parseUploadAssetAnalysis } from "@/lib/clipstitchr/server/parseUploadAssetAnalysis";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { createFileFromR2Object } from "@/lib/clipstitchr/server/r2/createFileFromR2Object";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { readVideoClipScoreRequest } from "@/lib/clipstitchr/server/readVideoClipScoreRequest";
import { getClipCanBeScored } from "@/lib/clipstitchr/utils/getClipCanBeScored";

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

    const { clipId } = await readVideoClipScoreRequest(request);
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const clip = await convex.query(api.videoClips.get, { id: clipId });

    if (!clip) {
      return NextResponse.json(
        { message: "Video clip not found." },
        { status: 404 },
      );
    }

    if (!getClipCanBeScored(clip)) {
      return NextResponse.json(
        { message: "Only UGC and demo videos can be scored." },
        { status: 400 },
      );
    }

    await convex.mutation(api.rateLimits.consumeUploadVideoAnalysis, {
      secret: getRateLimitApiSecret(),
    });

    assertR2ObjectKeyBelongsToUser(clip.videoObject.key, userId);

    const sourceUrl = (await getR2DownloadSignedUrl(clip.videoObject.key)).url;
    const fallbackImageFile = clip.posterObject
      ? await createFileFromR2Object({
          fallbackFileName: "clip-score-poster.jpg",
          object: clip.posterObject,
          userId,
        }).catch(() => undefined)
      : undefined;
    const outputText = await createUploadVideoAnalysisOutputText({
      fallbackImageFile,
      mediaKind: clip.clipType === "demo" ? "demo-video" : "ugc-video",
      originalName: clip.originalName,
      replicate: createReplicateClient(),
      sourceSizeBytes: clip.videoObject.size,
      sourceUrl,
    });
    const performanceScore = parseUploadAssetAnalysis(
      outputText,
      clip.originalName,
    ).performanceScore;

    if (!performanceScore) {
      throw new Error("The clip score came back empty.");
    }

    await convex.mutation(api.videoClips.updatePerformanceScore, {
      id: clip.id,
      performanceScore,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ performanceScore });
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
            : "Unable to score this clip.",
      },
      { status: 500 },
    );
  }
}
