import { v } from "convex/values";
import { cliprCompositionStrategyValidator } from "./cliprCompositionStrategy";
import { cliprContentTypeValidator } from "./cliprContentType";
import { cliprDurationSecondsValidator } from "./cliprDurationSeconds";
import { cliprMusicMetadataValidator } from "./cliprMusicMetadata";
import { textOverlayValidator } from "./textOverlay";

export const cliprMetadataValidator = v.object({
  jobId: v.string(),
  productId: v.string(),
  productName: v.string(),
  contentType: v.optional(cliprContentTypeValidator),
  compositionStrategy: v.optional(cliprCompositionStrategyValidator),
  avatarId: v.string(),
  avatarPhotoId: v.string(),
  voiceId: v.string(),
  targetDurationSeconds: cliprDurationSecondsValidator,
  hookStyleKey: v.string(),
  hookTemplateId: v.string(),
  filledHook: v.string(),
  variablesUsed: v.record(v.string(), v.string()),
  script: v.string(),
  sceneCount: v.number(),
  finalDurationSeconds: v.number(),
  music: v.optional(cliprMusicMetadataValidator),
  textOverlay: v.optional(textOverlayValidator),
  providerModels: v.array(v.string()),
  createdAt: v.string(),
});
