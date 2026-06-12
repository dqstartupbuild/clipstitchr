import { v } from "convex/values";

export const cliprDurationSecondsValidator = v.union(
  v.literal(4),
  v.literal(5),
  v.literal(6),
  v.literal(7),
  v.literal(8),
  v.literal(9),
  v.literal(10),
  v.literal(30),
  v.literal(60),
);
