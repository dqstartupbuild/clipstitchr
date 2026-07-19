import { v } from "convex/values";

export const hookLabPostStatusValidator = v.union(
  v.literal("analyzing"),
  v.literal("ready"),
  v.literal("needs_attention"),
  v.literal("failed"),
);
