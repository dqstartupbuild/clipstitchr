import { v } from "convex/values";

export const studioLazyReelToolKeyValidator = v.union(
  v.literal("niche_report"),
  v.literal("study_videos"),
  v.literal("teardown"),
  v.literal("make_brief"),
  v.literal("breakout_laws"),
  v.literal("kill_the_slop"),
  v.literal("get_status"),
);
