import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { assetTagsValidator } from "./validators/assetTags";
import { avatarWardrobeStyleValidator } from "./validators/avatarWardrobeStyle";
import { cliprCompositionStrategyValidator } from "./validators/cliprCompositionStrategy";
import { cliprContentTypeValidator } from "./validators/cliprContentType";
import { cliprDurationSecondsValidator } from "./validators/cliprDurationSeconds";
import { cliprJobStageValidator } from "./validators/cliprJobStage";
import { cliprJobStatusValidator } from "./validators/cliprJobStatus";
import { cliprMetadataValidator } from "./validators/cliprMetadata";
import { cliprMusicMetadataValidator } from "./validators/cliprMusicMetadata";
import { cliprScenePlanValidator } from "./validators/cliprScenePlan";
import { clipTypeValidator } from "./validators/clipType";
import { longrClipSegmentValidator } from "./validators/longrClipSegment";
import { longrMusicClipValidator } from "./validators/longrMusicClip";
import { musicTrackSourceValidator } from "./validators/musicTrackSource";
import { r2ObjectValidator } from "./validators/r2Object";
import { replicateJobPurposeValidator } from "./validators/replicateJobPurpose";
import { replicatePredictionStatusValidator } from "./validators/replicatePredictionStatus";
import { swiprBackgroundSourceValidator } from "./validators/swiprBackgroundSource";
import { swiprProductSourceTypeValidator } from "./validators/swiprProductSourceType";
import { swiprSlideValidator } from "./validators/swiprSlide";
import { swaprMetadataValidator } from "./validators/swaprMetadata";
import { stitchMusicMetadataValidator } from "./validators/stitchMusicMetadata";
import { textOverlayValidator } from "./validators/textOverlay";
import { videoPlaybackRateValidator } from "./validators/videoPlaybackRate";
import { videoTrimRangeValidator } from "./validators/videoTrimRange";

export default defineSchema({
  waitlist: defineTable({
    name: v.string(),
    email: v.string(),
    normalizedEmail: v.string(),
    source: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_normalized_email", ["normalizedEmail"])
    .index("by_created", ["createdAt"]),
  videoClips: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    tags: assetTagsValidator,
    videoDescription: v.optional(v.string()),
    mainPersonDescription: v.optional(v.string()),
    outfitDescription: v.optional(v.string()),
    locationDescription: v.optional(v.string()),
    poseDescription: v.optional(v.string()),
    productDescription: v.optional(v.string()),
    productId: v.optional(v.string()),
    originalName: v.string(),
    clipType: clipTypeValidator,
    videoObject: r2ObjectValidator,
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    mimeType: v.string(),
    sourceMimeType: v.string(),
    size: v.number(),
    originalSize: v.number(),
    width: v.number(),
    height: v.number(),
    aspectRatio: v.number(),
    duration: v.number(),
    defaultTrimRange: v.optional(videoTrimRangeValidator),
    hasAudio: v.boolean(),
    swaprMetadata: v.optional(swaprMetadataValidator),
    cliprMetadata: v.optional(cliprMetadataValidator),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  photoAssets: defineTable({
    ownerId: v.string(),
    id: v.string(),
    avatarId: v.optional(v.string()),
    name: v.string(),
    tags: assetTagsValidator,
    avatarDescription: v.optional(v.string()),
    outfitDescription: v.optional(v.string()),
    locationDescription: v.optional(v.string()),
    poseDescription: v.optional(v.string()),
    originalName: v.string(),
    photoObject: r2ObjectValidator,
    originalObject: v.optional(r2ObjectValidator),
    thumbnailObject: v.optional(r2ObjectValidator),
    mimeType: v.string(),
    originalMimeType: v.optional(v.string()),
    size: v.number(),
    originalSize: v.optional(v.number()),
    width: v.number(),
    height: v.number(),
    originalWidth: v.optional(v.number()),
    originalHeight: v.optional(v.number()),
    preparation: v.optional(
      v.union(
        v.literal("ai-outpaint"),
        v.literal("original-portrait"),
        v.literal("auto-crop"),
      ),
    ),
    consentAcknowledgedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  avatars: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    wardrobeStyle: v.optional(avatarWardrobeStyleValidator),
    cliprVoiceId: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  products: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    productDetails: v.string(),
    audienceDetails: v.string(),
    inferredProblem: v.optional(v.string()),
    inferredPainPoints: v.array(v.string()),
    eligibleCliprHookStyleKeys: v.optional(v.array(v.string())),
    eligibleCliprHookTemplateIds: v.optional(v.array(v.string())),
    cliprPlaceholderFillers: v.optional(
      v.record(v.string(), v.array(v.string())),
    ),
    preferredCliprHookStyleKey: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  stitches: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    ugcClipName: v.string(),
    demoClipName: v.string(),
    ugcTrimRange: v.optional(videoTrimRangeValidator),
    demoTrimRange: v.optional(videoTrimRangeValidator),
    stitchObject: v.optional(r2ObjectValidator),
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    size: v.optional(v.number()),
    width: v.number(),
    height: v.number(),
    duration: v.number(),
    includeDemoAudio: v.optional(v.boolean()),
    includeUgcAudio: v.optional(v.boolean()),
    demoPlaybackRate: v.optional(videoPlaybackRateValidator),
    ugcPlaybackRate: v.optional(videoPlaybackRateValidator),
    music: v.optional(stitchMusicMetadataValidator),
    textOverlay: v.optional(textOverlayValidator),
    createdAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  longrVideos: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    clipSegments: v.array(longrClipSegmentValidator),
    musicClips: v.optional(v.array(longrMusicClipValidator)),
    longrObject: r2ObjectValidator,
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    mimeType: v.string(),
    size: v.number(),
    width: v.number(),
    height: v.number(),
    duration: v.number(),
    createdAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  sharedMusicTracks: defineTable({
    id: v.string(),
    uploadedByOwnerId: v.string(),
    title: v.string(),
    tags: assetTagsValidator,
    style: v.optional(v.string()),
    durationSeconds: v.number(),
    audioObject: r2ObjectValidator,
    ownerAudioObject: v.optional(r2ObjectValidator),
    mimeType: v.string(),
    size: v.number(),
    prompt: v.optional(v.string()),
    providerModel: v.optional(v.string()),
    providerPredictionId: v.optional(v.string()),
    source: musicTrackSourceValidator,
    createdAt: v.string(),
  })
    .index("by_created", ["createdAt"])
    .index("by_music_id", ["id"]),
  swiprBackgrounds: defineTable({
    id: v.string(),
    uploadedByOwnerId: v.string(),
    name: v.string(),
    tags: assetTagsValidator,
    description: v.optional(v.string()),
    details: v.optional(v.string()),
    source: swiprBackgroundSourceValidator,
    imageObject: r2ObjectValidator,
    mimeType: v.string(),
    size: v.number(),
    width: v.number(),
    height: v.number(),
    createdAt: v.string(),
  })
    .index("by_created", ["createdAt"])
    .index("by_background_id", ["id"]),
  swipes: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    productSourceType: swiprProductSourceTypeValidator,
    productSourceId: v.string(),
    productContext: v.string(),
    productName: v.string(),
    backgroundId: v.string(),
    slides: v.array(swiprSlideValidator),
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_updated", ["ownerId", "updatedAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  replicateJobs: defineTable({
    ownerId: v.string(),
    predictionId: v.string(),
    purpose: replicateJobPurposeValidator,
    modelId: v.string(),
    status: replicatePredictionStatusValidator,
    outputUrl: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_prediction", ["ownerId", "predictionId"]),
  cliprJobs: defineTable({
    ownerId: v.string(),
    id: v.string(),
    productId: v.string(),
    productName: v.string(),
    productDetails: v.string(),
    audienceDetails: v.string(),
    productInferredProblem: v.optional(v.string()),
    productInferredPainPoints: v.array(v.string()),
    contentType: v.optional(cliprContentTypeValidator),
    compositionStrategy: v.optional(cliprCompositionStrategyValidator),
    avatarId: v.string(),
    avatarName: v.string(),
    avatarPhotoId: v.string(),
    voiceId: v.string(),
    targetDurationSeconds: cliprDurationSecondsValidator,
    avatarImageObject: v.optional(r2ObjectValidator),
    avatarVideoObject: v.optional(r2ObjectValidator),
    avatarImageProviderPredictionId: v.optional(v.string()),
    avatarVideoProviderPredictionId: v.optional(v.string()),
    music: v.optional(cliprMusicMetadataValidator),
    hookStyleKey: v.optional(v.string()),
    hookTemplateId: v.optional(v.string()),
    filledHook: v.optional(v.string()),
    variablesUsed: v.optional(v.record(v.string(), v.string())),
    script: v.optional(v.string()),
    overlayText: v.optional(v.string()),
    scenePlan: v.array(cliprScenePlanValidator),
    providerModels: v.array(v.string()),
    status: cliprJobStatusValidator,
    stage: cliprJobStageValidator,
    progress: v.number(),
    finalClipId: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
    finalizedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  cliprUserPreferences: defineTable({
    ownerId: v.string(),
    defaultVoiceId: v.string(),
    updatedAt: v.string(),
  }).index("by_owner", ["ownerId"]),
});
