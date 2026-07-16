import { v } from "convex/values";

export const usageReservationStateValidator = v.union(
  v.literal("reserved"),
  v.literal("committed"),
  v.literal("released"),
  v.literal("expired"),
);
