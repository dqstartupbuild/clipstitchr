import { v } from "convex/values";

export const hookLabIdeaUseStatusValidator = v.union(
  v.literal("queued"),
  v.literal("generating"),
  v.literal("partial"),
  v.literal("completed"),
  v.literal("failed"),
);
