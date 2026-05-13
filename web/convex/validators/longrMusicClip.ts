import { v } from "convex/values";

export const longrMusicClipValidator = v.object({
  id: v.string(),
  trackId: v.string(),
  trackTitle: v.string(),
  durationSeconds: v.number(),
  sourceStartSeconds: v.number(),
  sourceEndSeconds: v.number(),
  timelineStartSeconds: v.number(),
  volume: v.number(),
});
