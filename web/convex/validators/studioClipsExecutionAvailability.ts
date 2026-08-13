import { v } from "convex/values";

export const studioClipsExecutionAvailabilityValidator = v.union(
  v.object({ state: v.literal("available") }),
  v.object({
    message: v.string(),
    reasonCode: v.literal("worker_adapter_not_configured"),
    state: v.literal("unavailable"),
  }),
);
