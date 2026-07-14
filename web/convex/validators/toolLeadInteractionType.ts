import { v } from "convex/values";

export const toolLeadInteractionTypeValidator = v.union(
  v.literal("resultViewed"),
  v.literal("resourceUnlocked"),
  v.literal("paidCtaClicked"),
);
