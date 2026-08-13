import { v } from "convex/values";

export const studioReelWorkerProgressCodeValidator = v.union(
  v.literal("worker_started"),
  v.literal("sources_acquired"),
  v.literal("gemini_ready"),
  v.literal("voice_ready"),
  v.literal("rendered"),
  v.literal("output_stored"),
  v.literal("completed"),
  v.literal("cancelled"),
  v.literal("failed"),
);
