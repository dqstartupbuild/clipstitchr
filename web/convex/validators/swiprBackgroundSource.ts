import { v } from "convex/values";

export const swiprBackgroundSourceValidator = v.union(
  v.literal("ai"),
  v.literal("avatar-photo"),
  v.literal("pexels"),
  v.literal("seed"),
  v.literal("upload"),
);
