import { v } from "convex/values";

export const generationSlotStateValidator = v.union(
  v.literal("waiting"),
  v.literal("active"),
  v.literal("released"),
  v.literal("expired"),
);
