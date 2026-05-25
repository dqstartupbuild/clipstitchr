import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "./_generated/api";
import type { DataModel, Doc } from "./_generated/dataModel";

export type VideoClipCountKey = "clipr" | "demo" | "swapr" | "ugc";

export function getVideoClipCountKey(
  clip: Doc<"videoClips">,
): VideoClipCountKey {
  if (clip.cliprMetadata) {
    return "clipr";
  }

  if (clip.swaprMetadata?.source === "swapr") {
    return "swapr";
  }

  if (clip.clipType === "demo") {
    return "demo";
  }

  return "ugc";
}

export const videoClipCounts = new TableAggregate<{
  DataModel: DataModel;
  Key: VideoClipCountKey;
  Namespace: string;
  TableName: "videoClips";
}>(components.videoClipCounts, {
  namespace: (clip) => clip.ownerId,
  sortKey: getVideoClipCountKey,
});

export const stitchCounts = new TableAggregate<{
  DataModel: DataModel;
  Key: null;
  Namespace: string;
  TableName: "stitches";
}>(components.stitchCounts, {
  namespace: (stitch) => stitch.ownerId,
  sortKey: () => null,
});
