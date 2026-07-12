import { v } from "convex/values";

export const hookLabIdeaScopeFilterValidator = v.union(
  v.literal("current"),
  v.literal("shared"),
  v.literal("product"),
  v.literal("all"),
);
