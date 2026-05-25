import { v } from "convex/values";

export const stitchrModeValidator = v.union(
  v.literal("normal"),
  v.literal("longr"),
);
