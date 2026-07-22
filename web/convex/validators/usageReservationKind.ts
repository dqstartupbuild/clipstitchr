import { v } from "convex/values";

export const usageReservationKindValidator = v.union(
  v.literal("browser"),
  v.literal("server"),
  v.literal("worker"),
);
