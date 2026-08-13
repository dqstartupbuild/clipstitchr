import { v } from "convex/values";

export const studioReelRunKindValidator = v.union(
  v.literal("sample"),
  v.literal("remaining"),
);
