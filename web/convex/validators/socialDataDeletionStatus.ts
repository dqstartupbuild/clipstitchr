import { v } from "convex/values";

export const socialDataDeletionStatusValidator = v.union(
  v.literal("requested"),
  v.literal("processing"),
  v.literal("completed"),
  v.literal("failed"),
);
