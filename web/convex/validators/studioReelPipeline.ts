import { v } from "convex/values";

export const studioReelPipelineValidator = v.union(
  v.literal("classicReel"),
  v.literal("talkingVideo"),
);
