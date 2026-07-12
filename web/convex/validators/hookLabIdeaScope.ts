import { v } from "convex/values";

export const hookLabIdeaScopeValidator = v.union(
  v.literal("shared"),
  v.literal("product"),
);
