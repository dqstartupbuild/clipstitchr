import { v } from "convex/values";

export const hookLabIdeaStatusValidator = v.union(
  v.literal("analyzing"),
  v.literal("ready"),
  v.literal("generating"),
  v.literal("needs_attention"),
  v.literal("failed"),
  v.literal("archived"),
);
