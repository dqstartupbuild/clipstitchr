import { v } from "convex/values";

export const studioLazyReelReportStatusValidator = v.union(
  v.literal("active"),
  v.literal("archived"),
);
