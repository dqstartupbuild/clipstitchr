/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activeWorkerJobs from "../activeWorkerJobs.js";
import type * as adjustNotificationUnreadSummary from "../adjustNotificationUnreadSummary.js";
import type * as aggregateBackfills from "../aggregateBackfills.js";
import type * as aggregateCounts from "../aggregateCounts.js";
import type * as assertProductBelongsToOwner from "../assertProductBelongsToOwner.js";
import type * as assignLegacyRecordsToProduct from "../assignLegacyRecordsToProduct.js";
import type * as auth_assertAutomationWorkerSecret from "../auth/assertAutomationWorkerSecret.js";
import type * as auth_assertMediaWorkerSecret from "../auth/assertMediaWorkerSecret.js";
import type * as auth_assertProviderWorkerSecret from "../auth/assertProviderWorkerSecret.js";
import type * as auth_assertRateLimitApiSecret from "../auth/assertRateLimitApiSecret.js";
import type * as auth_getAuthenticatedOwnerId from "../auth/getAuthenticatedOwnerId.js";
import type * as automationAvatarPhoto from "../automationAvatarPhoto.js";
import type * as automationBudget from "../automationBudget.js";
import type * as automationClipr from "../automationClipr.js";
import type * as automationCreateRun from "../automationCreateRun.js";
import type * as automationCreateTask from "../automationCreateTask.js";
import type * as automationGlobalWindow from "../automationGlobalWindow.js";
import type * as automationLimits from "../automationLimits.js";
import type * as automationMarkRunSkipped from "../automationMarkRunSkipped.js";
import type * as automationPlannerCandidates from "../automationPlannerCandidates.js";
import type * as automationPreferences from "../automationPreferences.js";
import type * as automationRuns from "../automationRuns.js";
import type * as automationScheduler from "../automationScheduler.js";
import type * as automationStitchr from "../automationStitchr.js";
import type * as automationStitchrPairScoring from "../automationStitchrPairScoring.js";
import type * as automationSwapr from "../automationSwapr.js";
import type * as automationSwipr from "../automationSwipr.js";
import type * as automationTasks from "../automationTasks.js";
import type * as avatarPreferences from "../avatarPreferences.js";
import type * as avatars from "../avatars.js";
import type * as cliprJobs from "../cliprJobs.js";
import type * as cliprPreferences from "../cliprPreferences.js";
import type * as createCompletedRunNotification from "../createCompletedRunNotification.js";
import type * as createNotification from "../createNotification.js";
import type * as createQuickEditSuggestionsFromMetadata from "../createQuickEditSuggestionsFromMetadata.js";
import type * as crons from "../crons.js";
import type * as dashboardSummary from "../dashboardSummary.js";
import type * as defaultAutomationCliprVoiceId from "../defaultAutomationCliprVoiceId.js";
import type * as getActiveWorkerJobSummary from "../getActiveWorkerJobSummary.js";
import type * as getAutomationPreferenceForProduct from "../getAutomationPreferenceForProduct.js";
import type * as getAutomationProductScopeKey from "../getAutomationProductScopeKey.js";
import type * as getAutomationRunHasIncompleteTasks from "../getAutomationRunHasIncompleteTasks.js";
import type * as getAutomationRunHasTasks from "../getAutomationRunHasTasks.js";
import type * as getAutomationTaskProductId from "../getAutomationTaskProductId.js";
import type * as getAutomationToolDisabledReason from "../getAutomationToolDisabledReason.js";
import type * as getAvatarNotificationCopy from "../getAvatarNotificationCopy.js";
import type * as getCliprGeneratedClipStorageFields from "../getCliprGeneratedClipStorageFields.js";
import type * as getCompletedRunAssetLabel from "../getCompletedRunAssetLabel.js";
import type * as getCompletedRunToolLabel from "../getCompletedRunToolLabel.js";
import type * as getDefaultAvatarForOwner from "../getDefaultAvatarForOwner.js";
import type * as getDefaultProductForOwner from "../getDefaultProductForOwner.js";
import type * as getEnabledAutomationToolsForPreference from "../getEnabledAutomationToolsForPreference.js";
import type * as getOwnerHasContent from "../getOwnerHasContent.js";
import type * as getOwnerHasLegacyProductRecords from "../getOwnerHasLegacyProductRecords.js";
import type * as getOwnerHasStitches from "../getOwnerHasStitches.js";
import type * as getPhotoNotificationCopy from "../getPhotoNotificationCopy.js";
import type * as getPrimaryProductForOwner from "../getPrimaryProductForOwner.js";
import type * as getProductNameFromAutomationTasks from "../getProductNameFromAutomationTasks.js";
import type * as getQuickEditOverlayText from "../getQuickEditOverlayText.js";
import type * as getStitchNotificationCopy from "../getStitchNotificationCopy.js";
import type * as getStitchProductId from "../getStitchProductId.js";
import type * as getSwipeNotificationCopy from "../getSwipeNotificationCopy.js";
import type * as getSwiprSwipeReferencedBackgroundIds from "../getSwiprSwipeReferencedBackgroundIds.js";
import type * as getVideoClipCanBePosted from "../getVideoClipCanBePosted.js";
import type * as getVideoClipIsAccountWideUgc from "../getVideoClipIsAccountWideUgc.js";
import type * as getVideoClipLibraryKind from "../getVideoClipLibraryKind.js";
import type * as getVideoClipNotificationCopy from "../getVideoClipNotificationCopy.js";
import type * as getVideoClipProductScopeFilter from "../getVideoClipProductScopeFilter.js";
import type * as isWithinAutomationGlobalWindow from "../isWithinAutomationGlobalWindow.js";
import type * as libraryCounts from "../libraryCounts.js";
import type * as markAutomationRunCompletedIfAllTasksDone from "../markAutomationRunCompletedIfAllTasksDone.js";
import type * as markAutomationRunCompletedWhenTasksDone from "../markAutomationRunCompletedWhenTasksDone.js";
import type * as markAutomationRunStatus from "../markAutomationRunStatus.js";
import type * as mediaJobs from "../mediaJobs.js";
import type * as mediaWorkerLaunch from "../mediaWorkerLaunch.js";
import type * as notifications from "../notifications.js";
import type * as photoAssets from "../photoAssets.js";
import type * as productPreferences from "../productPreferences.js";
import type * as products from "../products.js";
import type * as providerJobs from "../providerJobs.js";
import type * as providerWorkerLaunch from "../providerWorkerLaunch.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as rateLimits from "../rateLimits.js";
import type * as recordStitchrBatchPairHistory from "../recordStitchrBatchPairHistory.js";
import type * as replicateJobs from "../replicateJobs.js";
import type * as sharedMusicTracks from "../sharedMusicTracks.js";
import type * as stitchTemplates_createFromStitch from "../stitchTemplates/createFromStitch.js";
import type * as stitchTemplates_createStitchTemplateDocumentFromStitch from "../stitchTemplates/createStitchTemplateDocumentFromStitch.js";
import type * as stitchTemplates_get from "../stitchTemplates/get.js";
import type * as stitchTemplates_getStitchTemplateBatchTextOverlay from "../stitchTemplates/getStitchTemplateBatchTextOverlay.js";
import type * as stitchTemplates_list from "../stitchTemplates/list.js";
import type * as stitchTemplates_remove from "../stitchTemplates/remove.js";
import type * as stitchTemplates_updateName from "../stitchTemplates/updateName.js";
import type * as stitches from "../stitches.js";
import type * as stitchrBatch from "../stitchrBatch.js";
import type * as stitchrBatchRunId from "../stitchrBatchRunId.js";
import type * as swipes from "../swipes.js";
import type * as swiprBackgrounds from "../swiprBackgrounds.js";
import type * as validators_assetTags from "../validators/assetTags.js";
import type * as validators_automationCliprGenerationMode from "../validators/automationCliprGenerationMode.js";
import type * as validators_automationGenerationCount from "../validators/automationGenerationCount.js";
import type * as validators_automationProvenance from "../validators/automationProvenance.js";
import type * as validators_automationRunStatus from "../validators/automationRunStatus.js";
import type * as validators_automationSelectionMode from "../validators/automationSelectionMode.js";
import type * as validators_automationStitchrTemplateAllocation from "../validators/automationStitchrTemplateAllocation.js";
import type * as validators_automationStitchrTextStyleChoice from "../validators/automationStitchrTextStyleChoice.js";
import type * as validators_automationTaskStatus from "../validators/automationTaskStatus.js";
import type * as validators_automationTaskType from "../validators/automationTaskType.js";
import type * as validators_automationTool from "../validators/automationTool.js";
import type * as validators_avatarWardrobeStyle from "../validators/avatarWardrobeStyle.js";
import type * as validators_clipPerformanceScore from "../validators/clipPerformanceScore.js";
import type * as validators_clipType from "../validators/clipType.js";
import type * as validators_cliprDurationSeconds from "../validators/cliprDurationSeconds.js";
import type * as validators_cliprGenerationMode from "../validators/cliprGenerationMode.js";
import type * as validators_cliprJobStage from "../validators/cliprJobStage.js";
import type * as validators_cliprJobStatus from "../validators/cliprJobStatus.js";
import type * as validators_cliprMetadata from "../validators/cliprMetadata.js";
import type * as validators_cliprMusicMetadata from "../validators/cliprMusicMetadata.js";
import type * as validators_cliprResolvedGenerationMode from "../validators/cliprResolvedGenerationMode.js";
import type * as validators_cliprScenePlan from "../validators/cliprScenePlan.js";
import type * as validators_cliprVideoModelId from "../validators/cliprVideoModelId.js";
import type * as validators_librarySortOrder from "../validators/librarySortOrder.js";
import type * as validators_mediaJobStatus from "../validators/mediaJobStatus.js";
import type * as validators_mediaJobType from "../validators/mediaJobType.js";
import type * as validators_musicTrackSource from "../validators/musicTrackSource.js";
import type * as validators_notificationSourceType from "../validators/notificationSourceType.js";
import type * as validators_providerJobStatus from "../validators/providerJobStatus.js";
import type * as validators_providerJobType from "../validators/providerJobType.js";
import type * as validators_quickEditBaseline from "../validators/quickEditBaseline.js";
import type * as validators_quickEditCrop from "../validators/quickEditCrop.js";
import type * as validators_quickEditMetadata from "../validators/quickEditMetadata.js";
import type * as validators_quickEditOverlayText from "../validators/quickEditOverlayText.js";
import type * as validators_quickEditRemoveRange from "../validators/quickEditRemoveRange.js";
import type * as validators_quickEditSuggestions from "../validators/quickEditSuggestions.js";
import type * as validators_r2Object from "../validators/r2Object.js";
import type * as validators_replicateJobPurpose from "../validators/replicateJobPurpose.js";
import type * as validators_replicatePredictionStatus from "../validators/replicatePredictionStatus.js";
import type * as validators_stitchMusicMetadata from "../validators/stitchMusicMetadata.js";
import type * as validators_stitchScore from "../validators/stitchScore.js";
import type * as validators_stitchSequenceSegment from "../validators/stitchSequenceSegment.js";
import type * as validators_stitchrMode from "../validators/stitchrMode.js";
import type * as validators_swaprMetadata from "../validators/swaprMetadata.js";
import type * as validators_swiprBackgroundSource from "../validators/swiprBackgroundSource.js";
import type * as validators_swiprProductSourceType from "../validators/swiprProductSourceType.js";
import type * as validators_swiprSlide from "../validators/swiprSlide.js";
import type * as validators_textOverlay from "../validators/textOverlay.js";
import type * as validators_videoClipLibraryKind from "../validators/videoClipLibraryKind.js";
import type * as validators_videoPlaybackRate from "../validators/videoPlaybackRate.js";
import type * as validators_videoTrimRange from "../validators/videoTrimRange.js";
import type * as videoClips from "../videoClips.js";
import type * as waitlist from "../waitlist.js";
import type * as workerContinuationDelayMs from "../workerContinuationDelayMs.js";
import type * as workerDispatch from "../workerDispatch.js";
import type * as workerLaunch from "../workerLaunch.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activeWorkerJobs: typeof activeWorkerJobs;
  adjustNotificationUnreadSummary: typeof adjustNotificationUnreadSummary;
  aggregateBackfills: typeof aggregateBackfills;
  aggregateCounts: typeof aggregateCounts;
  assertProductBelongsToOwner: typeof assertProductBelongsToOwner;
  assignLegacyRecordsToProduct: typeof assignLegacyRecordsToProduct;
  "auth/assertAutomationWorkerSecret": typeof auth_assertAutomationWorkerSecret;
  "auth/assertMediaWorkerSecret": typeof auth_assertMediaWorkerSecret;
  "auth/assertProviderWorkerSecret": typeof auth_assertProviderWorkerSecret;
  "auth/assertRateLimitApiSecret": typeof auth_assertRateLimitApiSecret;
  "auth/getAuthenticatedOwnerId": typeof auth_getAuthenticatedOwnerId;
  automationAvatarPhoto: typeof automationAvatarPhoto;
  automationBudget: typeof automationBudget;
  automationClipr: typeof automationClipr;
  automationCreateRun: typeof automationCreateRun;
  automationCreateTask: typeof automationCreateTask;
  automationGlobalWindow: typeof automationGlobalWindow;
  automationLimits: typeof automationLimits;
  automationMarkRunSkipped: typeof automationMarkRunSkipped;
  automationPlannerCandidates: typeof automationPlannerCandidates;
  automationPreferences: typeof automationPreferences;
  automationRuns: typeof automationRuns;
  automationScheduler: typeof automationScheduler;
  automationStitchr: typeof automationStitchr;
  automationStitchrPairScoring: typeof automationStitchrPairScoring;
  automationSwapr: typeof automationSwapr;
  automationSwipr: typeof automationSwipr;
  automationTasks: typeof automationTasks;
  avatarPreferences: typeof avatarPreferences;
  avatars: typeof avatars;
  cliprJobs: typeof cliprJobs;
  cliprPreferences: typeof cliprPreferences;
  createCompletedRunNotification: typeof createCompletedRunNotification;
  createNotification: typeof createNotification;
  createQuickEditSuggestionsFromMetadata: typeof createQuickEditSuggestionsFromMetadata;
  crons: typeof crons;
  dashboardSummary: typeof dashboardSummary;
  defaultAutomationCliprVoiceId: typeof defaultAutomationCliprVoiceId;
  getActiveWorkerJobSummary: typeof getActiveWorkerJobSummary;
  getAutomationPreferenceForProduct: typeof getAutomationPreferenceForProduct;
  getAutomationProductScopeKey: typeof getAutomationProductScopeKey;
  getAutomationRunHasIncompleteTasks: typeof getAutomationRunHasIncompleteTasks;
  getAutomationRunHasTasks: typeof getAutomationRunHasTasks;
  getAutomationTaskProductId: typeof getAutomationTaskProductId;
  getAutomationToolDisabledReason: typeof getAutomationToolDisabledReason;
  getAvatarNotificationCopy: typeof getAvatarNotificationCopy;
  getCliprGeneratedClipStorageFields: typeof getCliprGeneratedClipStorageFields;
  getCompletedRunAssetLabel: typeof getCompletedRunAssetLabel;
  getCompletedRunToolLabel: typeof getCompletedRunToolLabel;
  getDefaultAvatarForOwner: typeof getDefaultAvatarForOwner;
  getDefaultProductForOwner: typeof getDefaultProductForOwner;
  getEnabledAutomationToolsForPreference: typeof getEnabledAutomationToolsForPreference;
  getOwnerHasContent: typeof getOwnerHasContent;
  getOwnerHasLegacyProductRecords: typeof getOwnerHasLegacyProductRecords;
  getOwnerHasStitches: typeof getOwnerHasStitches;
  getPhotoNotificationCopy: typeof getPhotoNotificationCopy;
  getPrimaryProductForOwner: typeof getPrimaryProductForOwner;
  getProductNameFromAutomationTasks: typeof getProductNameFromAutomationTasks;
  getQuickEditOverlayText: typeof getQuickEditOverlayText;
  getStitchNotificationCopy: typeof getStitchNotificationCopy;
  getStitchProductId: typeof getStitchProductId;
  getSwipeNotificationCopy: typeof getSwipeNotificationCopy;
  getSwiprSwipeReferencedBackgroundIds: typeof getSwiprSwipeReferencedBackgroundIds;
  getVideoClipCanBePosted: typeof getVideoClipCanBePosted;
  getVideoClipIsAccountWideUgc: typeof getVideoClipIsAccountWideUgc;
  getVideoClipLibraryKind: typeof getVideoClipLibraryKind;
  getVideoClipNotificationCopy: typeof getVideoClipNotificationCopy;
  getVideoClipProductScopeFilter: typeof getVideoClipProductScopeFilter;
  isWithinAutomationGlobalWindow: typeof isWithinAutomationGlobalWindow;
  libraryCounts: typeof libraryCounts;
  markAutomationRunCompletedIfAllTasksDone: typeof markAutomationRunCompletedIfAllTasksDone;
  markAutomationRunCompletedWhenTasksDone: typeof markAutomationRunCompletedWhenTasksDone;
  markAutomationRunStatus: typeof markAutomationRunStatus;
  mediaJobs: typeof mediaJobs;
  mediaWorkerLaunch: typeof mediaWorkerLaunch;
  notifications: typeof notifications;
  photoAssets: typeof photoAssets;
  productPreferences: typeof productPreferences;
  products: typeof products;
  providerJobs: typeof providerJobs;
  providerWorkerLaunch: typeof providerWorkerLaunch;
  rateLimiter: typeof rateLimiter;
  rateLimits: typeof rateLimits;
  recordStitchrBatchPairHistory: typeof recordStitchrBatchPairHistory;
  replicateJobs: typeof replicateJobs;
  sharedMusicTracks: typeof sharedMusicTracks;
  "stitchTemplates/createFromStitch": typeof stitchTemplates_createFromStitch;
  "stitchTemplates/createStitchTemplateDocumentFromStitch": typeof stitchTemplates_createStitchTemplateDocumentFromStitch;
  "stitchTemplates/get": typeof stitchTemplates_get;
  "stitchTemplates/getStitchTemplateBatchTextOverlay": typeof stitchTemplates_getStitchTemplateBatchTextOverlay;
  "stitchTemplates/list": typeof stitchTemplates_list;
  "stitchTemplates/remove": typeof stitchTemplates_remove;
  "stitchTemplates/updateName": typeof stitchTemplates_updateName;
  stitches: typeof stitches;
  stitchrBatch: typeof stitchrBatch;
  stitchrBatchRunId: typeof stitchrBatchRunId;
  swipes: typeof swipes;
  swiprBackgrounds: typeof swiprBackgrounds;
  "validators/assetTags": typeof validators_assetTags;
  "validators/automationCliprGenerationMode": typeof validators_automationCliprGenerationMode;
  "validators/automationGenerationCount": typeof validators_automationGenerationCount;
  "validators/automationProvenance": typeof validators_automationProvenance;
  "validators/automationRunStatus": typeof validators_automationRunStatus;
  "validators/automationSelectionMode": typeof validators_automationSelectionMode;
  "validators/automationStitchrTemplateAllocation": typeof validators_automationStitchrTemplateAllocation;
  "validators/automationStitchrTextStyleChoice": typeof validators_automationStitchrTextStyleChoice;
  "validators/automationTaskStatus": typeof validators_automationTaskStatus;
  "validators/automationTaskType": typeof validators_automationTaskType;
  "validators/automationTool": typeof validators_automationTool;
  "validators/avatarWardrobeStyle": typeof validators_avatarWardrobeStyle;
  "validators/clipPerformanceScore": typeof validators_clipPerformanceScore;
  "validators/clipType": typeof validators_clipType;
  "validators/cliprDurationSeconds": typeof validators_cliprDurationSeconds;
  "validators/cliprGenerationMode": typeof validators_cliprGenerationMode;
  "validators/cliprJobStage": typeof validators_cliprJobStage;
  "validators/cliprJobStatus": typeof validators_cliprJobStatus;
  "validators/cliprMetadata": typeof validators_cliprMetadata;
  "validators/cliprMusicMetadata": typeof validators_cliprMusicMetadata;
  "validators/cliprResolvedGenerationMode": typeof validators_cliprResolvedGenerationMode;
  "validators/cliprScenePlan": typeof validators_cliprScenePlan;
  "validators/cliprVideoModelId": typeof validators_cliprVideoModelId;
  "validators/librarySortOrder": typeof validators_librarySortOrder;
  "validators/mediaJobStatus": typeof validators_mediaJobStatus;
  "validators/mediaJobType": typeof validators_mediaJobType;
  "validators/musicTrackSource": typeof validators_musicTrackSource;
  "validators/notificationSourceType": typeof validators_notificationSourceType;
  "validators/providerJobStatus": typeof validators_providerJobStatus;
  "validators/providerJobType": typeof validators_providerJobType;
  "validators/quickEditBaseline": typeof validators_quickEditBaseline;
  "validators/quickEditCrop": typeof validators_quickEditCrop;
  "validators/quickEditMetadata": typeof validators_quickEditMetadata;
  "validators/quickEditOverlayText": typeof validators_quickEditOverlayText;
  "validators/quickEditRemoveRange": typeof validators_quickEditRemoveRange;
  "validators/quickEditSuggestions": typeof validators_quickEditSuggestions;
  "validators/r2Object": typeof validators_r2Object;
  "validators/replicateJobPurpose": typeof validators_replicateJobPurpose;
  "validators/replicatePredictionStatus": typeof validators_replicatePredictionStatus;
  "validators/stitchMusicMetadata": typeof validators_stitchMusicMetadata;
  "validators/stitchScore": typeof validators_stitchScore;
  "validators/stitchSequenceSegment": typeof validators_stitchSequenceSegment;
  "validators/stitchrMode": typeof validators_stitchrMode;
  "validators/swaprMetadata": typeof validators_swaprMetadata;
  "validators/swiprBackgroundSource": typeof validators_swiprBackgroundSource;
  "validators/swiprProductSourceType": typeof validators_swiprProductSourceType;
  "validators/swiprSlide": typeof validators_swiprSlide;
  "validators/textOverlay": typeof validators_textOverlay;
  "validators/videoClipLibraryKind": typeof validators_videoClipLibraryKind;
  "validators/videoPlaybackRate": typeof validators_videoPlaybackRate;
  "validators/videoTrimRange": typeof validators_videoTrimRange;
  videoClips: typeof videoClips;
  waitlist: typeof waitlist;
  workerContinuationDelayMs: typeof workerContinuationDelayMs;
  workerDispatch: typeof workerDispatch;
  workerLaunch: typeof workerLaunch;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  videoClipCounts: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"videoClipCounts">;
  videoClipProductCounts: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"videoClipProductCounts">;
  stitchCounts: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"stitchCounts">;
  stitchProductCounts: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"stitchProductCounts">;
};
