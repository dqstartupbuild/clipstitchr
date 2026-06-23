import { v } from "convex/values";

export const quickEditCandidateSignalValidator = v.union(
  v.literal("black-frame"),
  v.literal("loading-spinner"),
  v.literal("loading-text"),
  v.literal("long-pause"),
  v.literal("low-motion"),
  v.literal("no-words"),
  v.literal("repeated-frame"),
  v.literal("scene-change"),
  v.literal("silence"),
  v.literal("static-frame"),
);
