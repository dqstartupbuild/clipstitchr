import { v } from "convex/values";

export const stitchrHookFeedbackStatusValidator = v.union(
  v.literal("accepted"),
  v.literal("rejected"),
);
