import { v } from "convex/values";

export const mediaJobTypeValidator = v.union(
  v.literal("clipr-finalization"),
  v.literal("stitchr-draft-finalization"),
  v.literal("stitchr-export"),
  v.literal("stitchr-longr-export"),
  v.literal("swapr-finalization"),
  v.literal("upload-normalization"),
);
