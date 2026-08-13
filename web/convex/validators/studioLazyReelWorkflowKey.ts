import { v } from "convex/values";

export const studioLazyReelWorkflowKeyValidator = v.union(
  v.literal("format_deconstructor"),
  v.literal("format_prompt_builder"),
  v.literal("higgsfield_director"),
  v.literal("ugc_ad_director"),
  v.literal("ugc_ad_generator"),
  v.literal("video_editor"),
);
