import type { Doc } from "@/convex/_generated/dataModel";
import { MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES } from "@/lib/clipstitchr/constants/maxUploadVideoAnalysisSizeBytes";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";

async function createSignedVideoInput(key: string, userId: string) {
  assertR2ObjectKeyBelongsToUser(key, userId);

  return (await getR2DownloadSignedUrl(key)).url;
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
    return {
      videoInputDescription:
        "The actual rendered stitch video is attached as the only video input.",
      videos: [await createSignedVideoInput(stitch.stitchObject.key, userId)],
    };
  }

  return {
    videoInputDescription:
      "No rendered stitch video is saved yet, so use the saved stitch settings and source clip notes.",
    videos: [],
  };
}
