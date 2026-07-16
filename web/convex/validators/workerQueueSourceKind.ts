import { v } from "convex/values";

export const workerQueueSourceKindValidator = v.union(
  v.literal("provider_job"),
  v.literal("media_job"),
  v.literal("automation_task"),
);
