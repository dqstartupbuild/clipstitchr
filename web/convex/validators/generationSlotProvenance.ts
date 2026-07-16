import { v } from "convex/values";

export const generationSlotProvenanceValidator = v.union(
  v.literal("browser"),
  v.literal("worker_queue"),
);
