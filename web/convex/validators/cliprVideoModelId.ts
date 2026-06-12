import { v } from "convex/values";

export const cliprVideoModelIdValidator = v.union(
  v.literal("auto"),
  v.literal("prunaai/p-video-avatar"),
  v.literal("kwaivgi/kling-v3-video"),
  v.literal("bytedance/seedance-2.0"),
  v.literal("google/veo-3.1"),
  v.literal("openai/sora-2"),
  v.literal("openai/sora-2-pro"),
);
