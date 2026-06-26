import type { Doc } from "./_generated/dataModel";

type StoredStitchScore = NonNullable<Doc<"stitches">["stitchScore"]>;

export function getFirstStitchScoreUpdate({
  stitch,
  stitchScore,
}: {
  stitch: Pick<Doc<"stitches">, "firstStitchScore" | "stitchScore">;
  stitchScore: StoredStitchScore;
}) {
  return stitch.firstStitchScore ?? stitch.stitchScore ?? stitchScore;
}
