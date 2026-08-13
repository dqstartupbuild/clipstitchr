import { v } from "convex/values";

export const studioReelWorkerCheckpointValidator = v.union(
  v.literal("claim_validated"),
  v.literal("sources_acquired"),
  v.literal("gemini_ready"),
  v.literal("voice_ready"),
  v.literal("rendered"),
  v.literal("output_stored"),
  v.literal("completed"),
);
