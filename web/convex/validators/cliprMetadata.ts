import { v } from "convex/values";
import { cliprDurationSecondsValidator } from "./cliprDurationSeconds";
import { cliprGenerationModeValidator } from "./cliprGenerationMode";
import { cliprMusicMetadataValidator } from "./cliprMusicMetadata";
import { cliprResolvedGenerationModeValidator } from "./cliprResolvedGenerationMode";
import { cliprVideoModelIdValidator } from "./cliprVideoModelId";

export const cliprMetadataValidator = v.object({
  jobId: v.string(),
  productId: v.string(),
  productName: v.string(),
  avatarId: v.string(),
  avatarPhotoId: v.string(),
  demoClipId: v.optional(v.string()),
  demoClipName: v.optional(v.string()),
  voiceId: v.string(),
  requestedGenerationMode: v.optional(cliprGenerationModeValidator),
  generationMode: v.optional(cliprResolvedGenerationModeValidator),
  requestedVideoModelId: v.optional(cliprVideoModelIdValidator),
  videoModelId: v.optional(cliprVideoModelIdValidator),
  scriptIdea: v.optional(v.string()),
  targetDurationSeconds: cliprDurationSecondsValidator,
  hookStyleKey: v.string(),
  hookTemplateId: v.string(),
  filledHook: v.string(),
  variablesUsed: v.record(v.string(), v.string()),
  script: v.string(),
  sceneCount: v.number(),
  finalDurationSeconds: v.number(),
  music: v.optional(cliprMusicMetadataValidator),
  providerModels: v.array(v.string()),
  createdAt: v.string(),
});
