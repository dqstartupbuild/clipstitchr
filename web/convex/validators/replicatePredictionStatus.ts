import { v } from "convex/values";

export const replicatePredictionStatusValidator = v.union(
  v.literal("starting"),
  v.literal("processing"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("canceled"),
  v.literal("aborted"),
);
