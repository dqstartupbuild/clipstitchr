import { v } from "convex/values";

export const studioLazyReelBriefApprovalStateValidator = v.union(
  v.literal("draft"),
  v.literal("approved"),
  v.literal("rejected"),
);
