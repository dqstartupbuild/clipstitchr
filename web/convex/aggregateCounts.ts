import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "./_generated/api";
import {
  getVideoClipLibraryKind,
  type VideoClipLibraryKind,
} from "./getVideoClipLibraryKind";
import type { DataModel, Doc } from "./_generated/dataModel";

export type VideoClipCountKey = VideoClipLibraryKind;

export function getVideoClipCountKey(
  clip: Doc<"videoClips">,
): VideoClipCountKey {
  return getVideoClipLibraryKind(clip);
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
