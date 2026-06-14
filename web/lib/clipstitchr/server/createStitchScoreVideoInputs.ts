import type { Doc } from "@/convex/_generated/dataModel";
import { MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES } from "@/lib/clipstitchr/constants/maxUploadVideoAnalysisSizeBytes";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";

const MAX_SOURCE_VIDEO_COUNT = 6;

async function createSignedVideoInput(key: string, userId: string) {
  assertR2ObjectKeyBelongsToUser(key, userId);

  return (await getR2DownloadSignedUrl(key)).url;
}

export async function createStitchScoreVideoInputs({
  sourceClips,
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

  const eligibleSourceClips = sourceClips
    .filter(
      (clip) => clip.videoObject.size <= MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES,
    )
    .slice(0, MAX_SOURCE_VIDEO_COUNT);

  if (!eligibleSourceClips.length) {
    return {
      videoInputDescription:
        "No video input was small enough to send, so use the saved stitch settings and source clip notes.",
      videos: [],
    };
  }

  return {
    videoInputDescription:
      "The source videos are attached in stitch order. Use the saved settings to judge the finished stitch.",
    videos: await Promise.all(
      eligibleSourceClips.map((clip) =>
        createSignedVideoInput(clip.videoObject.key, userId),
      ),
    ),
  };
}
