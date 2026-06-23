import type { Doc } from "@/convex/_generated/dataModel";
import { MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES } from "@/lib/clipstitchr/constants/maxUploadVideoAnalysisSizeBytes";
import { createQuickEditDetectorCandidates } from "@/lib/clipstitchr/server/createQuickEditDetectorCandidates";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";

export async function createStitchScoreDetectorCandidates({
  stitch,
  userId,
}: {
  stitch: Doc<"stitches">;
  userId: string;
}) {
  if (
    !stitch.stitchObject ||
    stitch.stitchObject.size > MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES
  ) {
    return [];
  }

  try {
    assertR2ObjectKeyBelongsToUser(stitch.stitchObject.key, userId);

    return await createQuickEditDetectorCandidates({
      sourceUrl: (await getR2DownloadSignedUrl(stitch.stitchObject.key)).url,
    });
  } catch {
    return [];
  }
}
