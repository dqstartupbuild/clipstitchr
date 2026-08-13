import { v } from "convex/values";

export const studioReelWorkerExecutionStateValidator = v.union(
  v.literal("processing"),
  v.literal("cancelled"),
  v.literal("failed"),
  v.literal("completed"),
);
