import { v } from "convex/values";

export const socialPublishModeValidator = v.union(
  v.literal("direct"),
  v.literal("draft"),
);
