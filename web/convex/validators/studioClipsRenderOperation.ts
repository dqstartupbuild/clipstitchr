import { v } from "convex/values";
import { studioClipsCaptionStyleValidator } from "./studioClipsCaptionStyle";
import { studioClipsPlatformPresetValidator } from "./studioClipsPlatformPreset";

export const studioClipsRenderOperationValidator = v.union(
  v.object({ endSeconds: v.number(), kind: v.literal("trim"), startSeconds: v.number() }),
  v.object({ kind: v.literal("split"), pointsSeconds: v.array(v.number()) }),
  v.object({ kind: v.literal("merge"), outputIds: v.array(v.string()) }),
  v.object({
    burnIn: v.boolean(),
    enabled: v.boolean(),
    kind: v.literal("captions"),
    languageCode: v.optional(v.string()),
    style: v.optional(studioClipsCaptionStyleValidator),
    styleSnapshotJson: v.optional(v.string()),
  }),
  v.object({ kind: v.literal("project_style"), style: studioClipsCaptionStyleValidator }),
  v.object({ instructions: v.optional(v.string()), kind: v.literal("regenerate") }),
  v.object({ kind: v.literal("platform_export"), preset: studioClipsPlatformPresetValidator }),
);
