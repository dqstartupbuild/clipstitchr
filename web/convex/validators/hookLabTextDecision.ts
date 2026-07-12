import { v } from "convex/values";

export const hookLabTextDecisionValidator = v.union(
  v.literal("reused"),
  v.literal("adapted"),
);
