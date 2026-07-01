import type { Doc } from "./_generated/dataModel";

export function getVideoClipCardSearchText(clip: Doc<"videoClips">) {
  return [
    clip.name,
    clip.originalName,
    clip.mainPersonDescription,
    clip.outfitDescription,
    clip.locationDescription,
    clip.poseDescription,
    clip.productDescription,
    clip.videoDescription,
    clip.clipType,
    ...(clip.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
