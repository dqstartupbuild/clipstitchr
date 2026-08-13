import { v } from "convex/values";

export const studioReelHandoffMetadataValidator = v.object({
  libraryAssetId: v.union(v.string(), v.null()),
  editorProjectId: v.union(v.string(), v.null()),
  publishingSourceId: v.union(v.string(), v.null()),
});
