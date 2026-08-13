import { v } from "convex/values";

export const studioLazyReelRunOutcomeValidator = v.union(
  v.literal("complete"),
  v.literal("partial"),
);
