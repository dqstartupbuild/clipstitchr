import { v } from "convex/values";

export const studioClipsSourceValidator = v.union(
  v.object({
    kind: v.literal("youtube"),
    url: v.string(),
  }),
  v.object({
    contentType: v.string(),
    kind: v.literal("r2"),
    objectKey: v.string(),
    sizeBytes: v.number(),
  }),
);
