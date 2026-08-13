import { v } from "convex/values";

export const studioClipsWriteOperationValidator = v.union(
  v.literal("create"),
  v.literal("cancel"),
  v.literal("resume"),
  v.literal("archive"),
  v.literal("trim"),
  v.literal("split"),
  v.literal("merge"),
  v.literal("captions"),
  v.literal("project_style"),
  v.literal("regenerate"),
  v.literal("accept"),
  v.literal("handoff"),
  v.literal("materialize"),
  v.literal("render_revision_create"),
  v.literal("render_revision_cancel"),
  v.literal("render_revision_resume"),
  v.literal("product_style"),
);
