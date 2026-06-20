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

export function getProductAggregateNamespace(
  ownerId: string,
  productId: string | undefined,
) {
  return `${ownerId}:${productId?.trim() || "__account__"}`;
}

export const videoClipProductCounts = new TableAggregate<{
  DataModel: DataModel;
  Key: VideoClipCountKey;
  Namespace: string;
  TableName: "videoClips";
}>(components.videoClipProductCounts, {
  namespace: (clip) =>
    getProductAggregateNamespace(clip.ownerId, clip.productId),
  sortKey: getVideoClipCountKey,
});

export type StitchProductCountKey = "active" | "posted";

export function getStitchProductCountKey(
  stitch: Doc<"stitches">,
): StitchProductCountKey {
  return stitch.isPosted ? "posted" : "active";
}

export const stitchCounts = new TableAggregate<{
  DataModel: DataModel;
  Key: null;
  Namespace: string;
  TableName: "stitches";
}>(components.stitchCounts, {
  namespace: (stitch) => stitch.ownerId,
  sortKey: () => null,
});

export const stitchProductCounts = new TableAggregate<{
  DataModel: DataModel;
  Key: StitchProductCountKey;
  Namespace: string;
  TableName: "stitches";
}>(components.stitchProductCounts, {
  namespace: (stitch) =>
    getProductAggregateNamespace(stitch.ownerId, stitch.productId),
  sortKey: getStitchProductCountKey,
});
