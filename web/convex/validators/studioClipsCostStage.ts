import { v } from "convex/values";

export const studioClipsCostStageValidator = v.union(
  v.literal("download"),
  v.literal("transcription"),
  v.literal("llm"),
  v.literal("b_roll"),
  v.literal("render"),
);
