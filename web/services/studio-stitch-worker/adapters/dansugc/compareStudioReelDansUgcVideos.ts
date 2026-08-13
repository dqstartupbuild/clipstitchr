import type { StudioReelDansUgcVideo } from "../../contracts/StudioReelDansUgcVideo";

export function compareStudioReelDansUgcVideos(
  left: StudioReelDansUgcVideo,
  right: StudioReelDansUgcVideo,
) {
  return (
    right.viralityScore - left.viralityScore ||
    (right.similarity ?? -1) - (left.similarity ?? -1) ||
    left.id.localeCompare(right.id)
  );
}
