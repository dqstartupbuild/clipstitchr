import { v } from "convex/values";

export const workerQueueStatusValidator = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("waiting"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("canceled"),
);
