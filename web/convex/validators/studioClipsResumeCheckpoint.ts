import { v } from "convex/values";

export const studioClipsResumeCheckpointValidator = v.union(
  v.literal("source_acquired"),
  v.literal("media_validated"),
  v.literal("transcribed"),
  v.literal("analyzed"),
  v.literal("b_roll_ready"),
  v.literal("rendered"),
  v.literal("output_stored"),
);
