import { v } from "convex/values";

export const studioClipsRenderOperationKindValidator = v.union(
  v.literal("trim"),
  v.literal("split"),
  v.literal("merge"),
  v.literal("captions"),
  v.literal("project_style"),
  v.literal("regenerate"),
  v.literal("platform_export"),
);
