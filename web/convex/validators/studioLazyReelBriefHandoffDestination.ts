import { v } from "convex/values";

export const studioLazyReelBriefHandoffDestinationValidator = v.union(
  v.literal("studio_edit"),
  v.literal("studio_stitch"),
);
