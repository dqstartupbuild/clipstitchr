import type { Doc } from "@/convex/_generated/dataModel";
import { createFileFromR2Object } from "@/lib/clipstitchr/server/r2/createFileFromR2Object";

export async function createStitchScorePosterFile({
  stitch,
  userId,
}: {
  stitch: Doc<"stitches">;
  userId: string;
}) {
  if (!stitch.posterObject) {
    return undefined;
  }

  return await createFileFromR2Object({
    fallbackFileName: "stitch-score-poster.jpg",
    object: stitch.posterObject,
    userId,
  }).catch(() => undefined);
}
