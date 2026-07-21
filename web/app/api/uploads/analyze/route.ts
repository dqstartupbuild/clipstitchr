import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createQuickEditDetectorCandidates } from "@/lib/clipstitchr/server/createQuickEditDetectorCandidates";
import { createUploadImageAnalysisOutputText } from "@/lib/clipstitchr/server/createUploadImageAnalysisOutputText";
import { createUploadVideoAnalysisOutputText } from "@/lib/clipstitchr/server/createUploadVideoAnalysisOutputText";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getOptionalUploadAnalysisFormFile } from "@/lib/clipstitchr/server/getOptionalUploadAnalysisFormFile";
import { getOptionalUploadAnalysisFormNumber } from "@/lib/clipstitchr/server/getOptionalUploadAnalysisFormNumber";
import { getUploadAnalysisFormFile } from "@/lib/clipstitchr/server/getUploadAnalysisFormFile";
import { getUploadAnalysisFormString } from "@/lib/clipstitchr/server/getUploadAnalysisFormString";
import { getUploadAnalysisIsVideoKind } from "@/lib/clipstitchr/server/getUploadAnalysisIsVideoKind";
import { getUploadAnalysisKind } from "@/lib/clipstitchr/server/getUploadAnalysisKind";
import { parseUploadAssetAnalysis } from "@/lib/clipstitchr/server/parseUploadAssetAnalysis";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { mergeQuickEditDetectorCandidatesIntoUploadAssetAnalysis } from "@/lib/clipstitchr/utils/mergeQuickEditDetectorCandidatesIntoUploadAssetAnalysis";
import { runAnalysisWithCredit } from "@/lib/clipstitchr/server/usage/runAnalysisWithCredit";

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

    const formData = await request.formData();
    const file = getOptionalUploadAnalysisFormFile(formData, "file");
    const fallbackImageFile = getOptionalUploadAnalysisFormFile(
      formData,
      "fallbackImage",
    );
    const originalName = getUploadAnalysisFormString(formData, "originalName");
    const mediaKind = getUploadAnalysisKind(
      getUploadAnalysisFormString(formData, "mediaKind"),
    );
    const sourceSizeBytes = getOptionalUploadAnalysisFormNumber(
      formData,
      "sourceSizeBytes",
    );
    const sourceUrl = getUploadAnalysisFormString(formData, "sourceUrl");
    const isVideoAnalysis = getUploadAnalysisIsVideoKind(mediaKind);
    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(
      isVideoAnalysis
        ? api.rateLimits.consumeUploadVideoAnalysis
        : api.rateLimits.consumeUploadAnalysis,
      {
        secret: getRateLimitApiSecret(),
      },
    );

    const analysis = await runAnalysisWithCredit({
      client: convex,
      operation: "ai_analysis",
      secret: getRateLimitApiSecret(),
      work: async () => {
        const replicate = createReplicateClient();
        const detectorCandidates = isVideoAnalysis
          ? await createQuickEditDetectorCandidates({ file, sourceUrl })
          : [];
        const outputText = isVideoAnalysis
          ? await createUploadVideoAnalysisOutputText({
              detectorCandidates,
              fallbackImageFile,
              file,
              mediaKind,
              originalName,
              replicate,
              sourceSizeBytes,
              sourceUrl,
            })
          : await createUploadImageAnalysisOutputText({
              file: getUploadAnalysisFormFile(formData, "file"),
              mediaKind,
              originalName,
              replicate,
            });

        return {
          detectorCandidates,
          parsed: parseUploadAssetAnalysis(outputText, originalName),
        };
      },
    });

    return NextResponse.json(
      isVideoAnalysis
        ? mergeQuickEditDetectorCandidatesIntoUploadAssetAnalysis({
            analysis: analysis.parsed,
            detectorCandidates: analysis.detectorCandidates,
          })
        : analysis.parsed,
    );
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
            : "Unable to analyze this upload.",
      },
      { status: 500 },
    );
  }
}
