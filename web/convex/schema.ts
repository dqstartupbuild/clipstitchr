import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { assetTagsValidator } from "./validators/assetTags";
import { automationProvenanceValidator } from "./validators/automationProvenance";
import { automationRunStatusValidator } from "./validators/automationRunStatus";
import { automationSelectionModeValidator } from "./validators/automationSelectionMode";
import { automationStitchrTextStyleChoiceValidator } from "./validators/automationStitchrTextStyleChoice";
import { automationTaskStatusValidator } from "./validators/automationTaskStatus";
import { automationTaskTypeValidator } from "./validators/automationTaskType";
import { automationToolValidator } from "./validators/automationTool";
import { automationCliprGenerationModeValidator } from "./validators/automationCliprGenerationMode";
import { avatarWardrobeStyleValidator } from "./validators/avatarWardrobeStyle";
import { cliprDurationSecondsValidator } from "./validators/cliprDurationSeconds";
import { cliprGenerationModeValidator } from "./validators/cliprGenerationMode";
import { cliprJobStageValidator } from "./validators/cliprJobStage";
import { cliprJobStatusValidator } from "./validators/cliprJobStatus";
import { cliprMetadataValidator } from "./validators/cliprMetadata";
import { cliprMusicMetadataValidator } from "./validators/cliprMusicMetadata";
import { clipPerformanceScoreValidator } from "./validators/clipPerformanceScore";
import { cliprResolvedGenerationModeValidator } from "./validators/cliprResolvedGenerationMode";
import { cliprScenePlanValidator } from "./validators/cliprScenePlan";
import { cliprVideoModelIdValidator } from "./validators/cliprVideoModelId";
import { clipTypeValidator } from "./validators/clipType";
import { mediaJobStatusValidator } from "./validators/mediaJobStatus";
import { mediaJobTypeValidator } from "./validators/mediaJobType";
import { musicTrackSourceValidator } from "./validators/musicTrackSource";
import { providerJobStatusValidator } from "./validators/providerJobStatus";
import { providerJobTypeValidator } from "./validators/providerJobType";
import { r2ObjectValidator } from "./validators/r2Object";
import { replicateJobPurposeValidator } from "./validators/replicateJobPurpose";
import { replicatePredictionStatusValidator } from "./validators/replicatePredictionStatus";
import { stitchScoreValidator } from "./validators/stitchScore";
import { stitchrModeValidator } from "./validators/stitchrMode";
import { stitchSequenceSegmentValidator } from "./validators/stitchSequenceSegment";
import { swiprBackgroundSourceValidator } from "./validators/swiprBackgroundSource";
import { swiprProductSourceTypeValidator } from "./validators/swiprProductSourceType";
import { swiprSlideValidator } from "./validators/swiprSlide";
import { swaprMetadataValidator } from "./validators/swaprMetadata";
import { stitchMusicMetadataValidator } from "./validators/stitchMusicMetadata";
import {
  textOverlayValidator,
  textOverlaysValidator,
} from "./validators/textOverlay";
import { videoPlaybackRateValidator } from "./validators/videoPlaybackRate";
import { videoClipLibraryKindValidator } from "./validators/videoClipLibraryKind";
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
    performanceScore: v.optional(clipPerformanceScoreValidator),
    productDescription: v.optional(v.string()),
    productId: v.optional(v.string()),
    originalName: v.string(),
    clipType: clipTypeValidator,
    libraryKind: v.optional(videoClipLibraryKindValidator),
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
    isPosted: v.optional(v.boolean()),
    postedAt: v.optional(v.string()),
    automation: v.optional(automationProvenanceValidator),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_is_posted_created", ["ownerId", "isPosted", "createdAt"])
    .index("by_owner_library_kind_created", [
      "ownerId",
      "libraryKind",
      "createdAt",
    ])
    .index("by_owner_library_kind_is_posted_created", [
      "ownerId",
      "libraryKind",
      "isPosted",
      "createdAt",
    ])
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
    automation: v.optional(automationProvenanceValidator),
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
  avatarPreferences: defineTable({
    ownerId: v.string(),
    defaultAvatarId: v.optional(v.string()),
    updatedAt: v.string(),
  }).index("by_owner", ["ownerId"]),
  products: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    productDetails: v.string(),
    audienceDetails: v.string(),
    emotionalNarrative: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
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
  productPreferences: defineTable({
    ownerId: v.string(),
    defaultProductId: v.optional(v.string()),
    updatedAt: v.string(),
  }).index("by_owner", ["ownerId"]),
  stitches: defineTable({
    ownerId: v.string(),
    id: v.string(),
    mode: v.optional(stitchrModeValidator),
    name: v.string(),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    ugcClipName: v.string(),
    demoClipName: v.string(),
    ugcTrimRange: v.optional(videoTrimRangeValidator),
    demoTrimRange: v.optional(videoTrimRangeValidator),
    sequenceSegments: v.optional(v.array(stitchSequenceSegmentValidator)),
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
    textOverlays: v.optional(textOverlaysValidator),
    socialCaption: v.optional(v.string()),
    stitchScore: v.optional(stitchScoreValidator),
    isPosted: v.optional(v.boolean()),
    postedAt: v.optional(v.string()),
    automation: v.optional(automationProvenanceValidator),
    createdAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_is_posted_created", ["ownerId", "isPosted", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  stitchTemplates: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    sourceStitchId: v.string(),
    sourceStitchName: v.string(),
    mode: v.optional(stitchrModeValidator),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    ugcClipName: v.string(),
    demoClipName: v.string(),
    ugcTrimRange: v.optional(videoTrimRangeValidator),
    demoTrimRange: v.optional(videoTrimRangeValidator),
    sequenceSegments: v.optional(v.array(stitchSequenceSegmentValidator)),
    width: v.number(),
    height: v.number(),
    duration: v.number(),
    includeDemoAudio: v.optional(v.boolean()),
    includeUgcAudio: v.optional(v.boolean()),
    demoPlaybackRate: v.optional(videoPlaybackRateValidator),
    ugcPlaybackRate: v.optional(videoPlaybackRateValidator),
    textOverlay: v.optional(textOverlayValidator),
    textOverlays: v.optional(textOverlaysValidator),
    socialCaption: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
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
    isPosted: v.optional(v.boolean()),
    postedAt: v.optional(v.string()),
    automation: v.optional(automationProvenanceValidator),
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
    avatarId: v.string(),
    avatarName: v.string(),
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
  mediaJobs: defineTable({
    ownerId: v.string(),
    id: v.string(),
    jobType: mediaJobTypeValidator,
    status: mediaJobStatusValidator,
    stage: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    outputAssetIds: v.array(v.string()),
    attempt: v.number(),
    lockedBy: v.optional(v.string()),
    lockedUntil: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_idempotency_key", ["idempotencyKey"]),
  providerJobs: defineTable({
    ownerId: v.string(),
    id: v.string(),
    jobType: providerJobTypeValidator,
    status: providerJobStatusValidator,
    stage: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    outputAssetIds: v.array(v.string()),
    providerJobIds: v.array(v.string()),
    mediaJobIds: v.array(v.string()),
    progress: v.number(),
    attempt: v.number(),
    lockedBy: v.optional(v.string()),
    lockedUntil: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_idempotency_key", ["idempotencyKey"]),
  workerLaunchState: defineTable({
    worker: v.union(v.literal("media"), v.literal("provider")),
    lastRequestedAt: v.string(),
    updatedAt: v.string(),
  }).index("by_worker", ["worker"]),
  automationPreferences: defineTable({
    ownerId: v.string(),
    enabled: v.boolean(),
    enabledTools: v.array(automationToolValidator),
    cliprGenerationMode: v.optional(automationCliprGenerationModeValidator),
    stitchrTextStyleChoice: v.optional(
      automationStitchrTextStyleChoiceValidator,
    ),
    stitchrTextColorChoice: v.optional(v.string()),
    stitchrTextBackgroundColorChoice: v.optional(v.string()),
    productSelectionMode: automationSelectionModeValidator,
    selectedProductIds: v.array(v.string()),
    avatarSelectionMode: automationSelectionModeValidator,
    selectedAvatarIds: v.array(v.string()),
    preferenceVersion: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_owner", ["ownerId"]),
  automationRuns: defineTable({
    ownerId: v.string(),
    id: v.string(),
    automationDate: v.string(),
    tool: automationToolValidator,
    status: automationRunStatusValidator,
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    dailyLimit: v.number(),
    attempt: v.number(),
    startedAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    skippedAt: v.optional(v.string()),
    failedAt: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_owner_date_tool", ["ownerId", "automationDate", "tool"])
    .index("by_idempotency_key", ["idempotencyKey"]),
  automationTasks: defineTable({
    ownerId: v.string(),
    id: v.string(),
    runId: v.string(),
    tool: automationToolValidator,
    taskType: automationTaskTypeValidator,
    status: automationTaskStatusValidator,
    stage: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    outputAssetIds: v.array(v.string()),
    providerJobIds: v.array(v.string()),
    mediaJobIds: v.array(v.string()),
    attempt: v.number(),
    lockedBy: v.optional(v.string()),
    lockedUntil: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_run", ["runId"])
    .index("by_idempotency_key", ["idempotencyKey"]),
  automationPairHistory: defineTable({
    ownerId: v.string(),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    lastUsedAt: v.string(),
    useCount: v.number(),
    recentUseWindowKey: v.string(),
    lastOutputStitchId: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_pair", ["ownerId", "ugcClipId", "demoClipId"])
    .index("by_owner_last_used", ["ownerId", "lastUsedAt"]),
});
