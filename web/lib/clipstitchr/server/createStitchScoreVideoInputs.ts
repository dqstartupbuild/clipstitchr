import type { Doc } from "@/convex/_generated/dataModel";
import { MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES } from "@/lib/clipstitchr/constants/maxUploadVideoAnalysisSizeBytes";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import type { GeminiVideoAnalysisInputDiagnostics } from "@/lib/clipstitchr/types/GeminiVideoAnalysisInputDiagnostics";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

async function createSignedVideoInput(
  object: R2ObjectReference,
  userId: string,
) {
  assertR2ObjectKeyBelongsToUser(object.key, userId);

  const signedVideo = await getR2DownloadSignedUrl(object.key);

  return {
    diagnostics: {
      featurePath: "stitch-score",
      inputMode: "signed-url",
      objectContentType: object.contentType,
      objectKey: object.key,
      objectSize: object.size,
      signedUrlExpiresSeconds: signedVideo.expiresIn,
      sourceUrl: signedVideo.url,
    } satisfies GeminiVideoAnalysisInputDiagnostics,
    url: signedVideo.url,
  };
}

export async function createStitchScoreVideoInputs({
  stitch,
  userId,
}: {
  sourceClips: Doc<"videoClips">[];
  stitch: Doc<"stitches">;
  userId: string;
}) {
  if (
    stitch.stitchObject &&
    stitch.stitchObject.size <= MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES
  ) {
    const signedVideo = await createSignedVideoInput(
      stitch.stitchObject,
      userId,
    );

    return {
      diagnostics: signedVideo.diagnostics,
      videoInputDescription:
        "The actual rendered stitch video is attached as the only video input.",
      videos: [signedVideo.url],
    };
  }

  return {
    videoInputDescription:
      "No rendered stitch video is saved yet, so use the saved stitch settings and source clip notes.",
    videos: [],
  };
}
