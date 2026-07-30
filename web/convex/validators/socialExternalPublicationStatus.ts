import { v } from "convex/values";

export const socialExternalPublicationStatusValidator = v.union(
  v.literal("processing"),
  v.literal("published"),
  v.literal("failed"),
  v.literal("removed"),
  v.literal("unknown"),
);
