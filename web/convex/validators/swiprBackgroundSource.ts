import { v } from "convex/values";

export const swiprBackgroundSourceValidator = v.union(
  v.literal("ai"),
  v.literal("upload"),
);
