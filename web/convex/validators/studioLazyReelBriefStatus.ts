import { v } from "convex/values";

export const studioLazyReelBriefStatusValidator = v.union(
  v.literal("active"),
  v.literal("archived"),
);
