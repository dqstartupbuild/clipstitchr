import { v } from "convex/values";

export const providerJobTypeValidator = v.union(
  v.literal("manual-swapr"),
  v.literal("manual-clipr"),
  v.literal("manual-swipr-draft"),
  v.literal("avatar-photo-generation"),
  v.literal("upload-video-analysis"),
  v.literal("stitch-score-analysis"),
  v.literal("swipr-background-generation"),
  v.literal("swipr-background-analysis"),
  v.literal("clipr-text"),
  v.literal("clipr-music"),
  v.literal("stitchr-music"),
  v.literal("shared-music"),
  v.literal("product-enrichment"),
  v.literal("swapr-photo-expansion"),
  v.literal("hook-lab-post-analysis"),
  v.literal("social-publish"),
  v.literal("social-status-reconcile"),
  v.literal("social-analytics-refresh"),
  v.literal("social-capability-refresh"),
);
