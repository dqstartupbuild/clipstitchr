/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aggregateBackfills from "../aggregateBackfills.js";
import type * as aggregateCounts from "../aggregateCounts.js";
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
import type * as avatars from "../avatars.js";
import type * as cliprJobs from "../cliprJobs.js";
import type * as cliprPreferences from "../cliprPreferences.js";
import type * as crons from "../crons.js";
import type * as defaultAutomationCliprVoiceId from "../defaultAutomationCliprVoiceId.js";
import type * as isWithinAutomationGlobalWindow from "../isWithinAutomationGlobalWindow.js";
import type * as libraryCounts from "../libraryCounts.js";
import type * as mediaJobs from "../mediaJobs.js";
import type * as photoAssets from "../photoAssets.js";
import type * as products from "../products.js";
import type * as providerJobs from "../providerJobs.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as rateLimits from "../rateLimits.js";
import type * as replicateJobs from "../replicateJobs.js";
import type * as sharedMusicTracks from "../sharedMusicTracks.js";
import type * as stitches from "../stitches.js";
import type * as swipes from "../swipes.js";
import type * as swiprBackgrounds from "../swiprBackgrounds.js";
import type * as validators_assetTags from "../validators/assetTags.js";
import type * as validators_automationProvenance from "../validators/automationProvenance.js";
import type * as validators_automationRunStatus from "../validators/automationRunStatus.js";
import type * as validators_automationSelectionMode from "../validators/automationSelectionMode.js";
import type * as validators_automationTaskStatus from "../validators/automationTaskStatus.js";
import type * as validators_automationTaskType from "../validators/automationTaskType.js";
import type * as validators_automationTool from "../validators/automationTool.js";
import type * as validators_avatarWardrobeStyle from "../validators/avatarWardrobeStyle.js";
import type * as validators_clipType from "../validators/clipType.js";
import type * as validators_cliprDurationSeconds from "../validators/cliprDurationSeconds.js";
import type * as validators_cliprJobStage from "../validators/cliprJobStage.js";
import type * as validators_cliprJobStatus from "../validators/cliprJobStatus.js";
import type * as validators_cliprMetadata from "../validators/cliprMetadata.js";
import type * as validators_cliprMusicMetadata from "../validators/cliprMusicMetadata.js";
import type * as validators_cliprScenePlan from "../validators/cliprScenePlan.js";
import type * as validators_librarySortOrder from "../validators/librarySortOrder.js";
import type * as validators_mediaJobStatus from "../validators/mediaJobStatus.js";
import type * as validators_mediaJobType from "../validators/mediaJobType.js";
import type * as validators_musicTrackSource from "../validators/musicTrackSource.js";
import type * as validators_providerJobStatus from "../validators/providerJobStatus.js";
import type * as validators_providerJobType from "../validators/providerJobType.js";
import type * as validators_r2Object from "../validators/r2Object.js";
import type * as validators_replicateJobPurpose from "../validators/replicateJobPurpose.js";
import type * as validators_replicatePredictionStatus from "../validators/replicatePredictionStatus.js";
import type * as validators_stitchMusicMetadata from "../validators/stitchMusicMetadata.js";
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

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aggregateBackfills: typeof aggregateBackfills;
  aggregateCounts: typeof aggregateCounts;
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
  avatars: typeof avatars;
  cliprJobs: typeof cliprJobs;
  cliprPreferences: typeof cliprPreferences;
  crons: typeof crons;
  defaultAutomationCliprVoiceId: typeof defaultAutomationCliprVoiceId;
  isWithinAutomationGlobalWindow: typeof isWithinAutomationGlobalWindow;
  libraryCounts: typeof libraryCounts;
  mediaJobs: typeof mediaJobs;
  photoAssets: typeof photoAssets;
  products: typeof products;
  providerJobs: typeof providerJobs;
  rateLimiter: typeof rateLimiter;
  rateLimits: typeof rateLimits;
  replicateJobs: typeof replicateJobs;
  sharedMusicTracks: typeof sharedMusicTracks;
  stitches: typeof stitches;
  swipes: typeof swipes;
  swiprBackgrounds: typeof swiprBackgrounds;
  "validators/assetTags": typeof validators_assetTags;
  "validators/automationProvenance": typeof validators_automationProvenance;
  "validators/automationRunStatus": typeof validators_automationRunStatus;
  "validators/automationSelectionMode": typeof validators_automationSelectionMode;
  "validators/automationTaskStatus": typeof validators_automationTaskStatus;
  "validators/automationTaskType": typeof validators_automationTaskType;
  "validators/automationTool": typeof validators_automationTool;
  "validators/avatarWardrobeStyle": typeof validators_avatarWardrobeStyle;
  "validators/clipType": typeof validators_clipType;
  "validators/cliprDurationSeconds": typeof validators_cliprDurationSeconds;
  "validators/cliprJobStage": typeof validators_cliprJobStage;
  "validators/cliprJobStatus": typeof validators_cliprJobStatus;
  "validators/cliprMetadata": typeof validators_cliprMetadata;
  "validators/cliprMusicMetadata": typeof validators_cliprMusicMetadata;
  "validators/cliprScenePlan": typeof validators_cliprScenePlan;
  "validators/librarySortOrder": typeof validators_librarySortOrder;
  "validators/mediaJobStatus": typeof validators_mediaJobStatus;
  "validators/mediaJobType": typeof validators_mediaJobType;
  "validators/musicTrackSource": typeof validators_musicTrackSource;
  "validators/providerJobStatus": typeof validators_providerJobStatus;
  "validators/providerJobType": typeof validators_providerJobType;
  "validators/r2Object": typeof validators_r2Object;
  "validators/replicateJobPurpose": typeof validators_replicateJobPurpose;
  "validators/replicatePredictionStatus": typeof validators_replicatePredictionStatus;
  "validators/stitchMusicMetadata": typeof validators_stitchMusicMetadata;
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
  stitchCounts: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"stitchCounts">;
};
