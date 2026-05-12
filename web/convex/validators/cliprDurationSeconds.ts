import { v } from "convex/values";

export const cliprDurationSecondsValidator = v.union(
  v.literal(30),
  v.literal(60),
);
