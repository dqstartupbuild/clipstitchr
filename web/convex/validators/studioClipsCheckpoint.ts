import { v } from "convex/values";

export const studioClipsCheckpointValidator = v.union(
  v.literal("claim_validated"),
  v.literal("source_acquired"),
  v.literal("media_validated"),
  v.literal("transcribed"),
  v.literal("analyzed"),
  v.literal("b_roll_ready"),
  v.literal("rendered"),
  v.literal("output_stored"),
  v.literal("completed"),
);
