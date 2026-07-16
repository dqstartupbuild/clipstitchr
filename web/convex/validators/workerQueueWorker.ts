import { v } from "convex/values";

export const workerQueueWorkerValidator = v.union(
  v.literal("provider"),
  v.literal("media"),
);
