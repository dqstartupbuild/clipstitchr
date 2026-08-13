import { v } from "convex/values";
import { studioClipsCaptionStyleValidator } from "./studioClipsCaptionStyle";

export const studioClipsTaskOptionsValidator = v.object({
  addSubtitles: v.boolean(),
  captionStyle: v.optional(studioClipsCaptionStyleValidator),
  includeBroll: v.boolean(),
  outputFormat: v.union(v.literal("source"), v.literal("vertical")),
});
