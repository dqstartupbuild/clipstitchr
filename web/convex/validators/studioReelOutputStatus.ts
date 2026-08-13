import { v } from "convex/values";

export const studioReelOutputStatusValidator = v.union(
  v.literal("generated"),
  v.literal("accepted"),
);
