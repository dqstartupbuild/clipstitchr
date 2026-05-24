import { v } from "convex/values";

export const cliprContentTypeValidator = v.union(
  v.literal("avatar-talking-head"),
  v.literal("b-roll-reel"),
  v.literal("text-shot"),
  v.literal("voiceover-reel"),
  v.literal("product-video"),
  v.literal("value-video"),
  v.literal("problem-solution"),
  v.literal("objection-handler"),
  v.literal("how-to"),
  v.literal("soft-cta"),
);
