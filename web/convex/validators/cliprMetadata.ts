import { v } from "convex/values";
import { cliprDurationSecondsValidator } from "./cliprDurationSeconds";
import { cliprMusicMetadataValidator } from "./cliprMusicMetadata";

export const cliprMetadataValidator = v.object({
  jobId: v.string(),
  productId: v.string(),
  productName: v.string(),
  avatarId: v.string(),
  avatarPhotoId: v.string(),
  voiceId: v.string(),
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
