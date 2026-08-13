export function getStudioStitchPipelineLabel(
  pipeline: "classicReel" | "talkingVideo",
) {
  return pipeline === "classicReel" ? "Classic reel" : "Talking video";
}
