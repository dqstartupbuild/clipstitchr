import type { Doc } from "@/convex/_generated/dataModel";

function formatScore(score?: Doc<"videoClips">["performanceScore"]) {
  if (!score) {
    return "No clip score saved.";
  }

  return [
    `Overall ${score.overall}`,
    score.hook === undefined ? "" : `hook ${score.hook}`,
    score.stitchFit === undefined ? "" : `stitch fit ${score.stitchFit}`,
    score.summary ? `note: ${score.summary}` : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function formatStitchScoreSourceClipContext({
  clip,
  index,
}: {
  clip: Doc<"videoClips">;
  index: number;
}) {
  return [
    `${index + 1}. ${clip.name} (${clip.clipType}, ${Math.round(clip.duration)}s)`,
    clip.videoDescription ? `Video: ${clip.videoDescription}` : "",
    clip.poseDescription ? `Action: ${clip.poseDescription}` : "",
    clip.productDescription ? `Product/demo: ${clip.productDescription}` : "",
    clip.mainPersonDescription ? `Person: ${clip.mainPersonDescription}` : "",
    clip.locationDescription ? `Setting: ${clip.locationDescription}` : "",
    `Saved clip score: ${formatScore(clip.performanceScore)}`,
  ]
    .filter(Boolean)
    .join("\n");
}
