/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_assertRateLimitApiSecret from "../auth/assertRateLimitApiSecret.js";
import type * as auth_getAuthenticatedOwnerId from "../auth/getAuthenticatedOwnerId.js";
import type * as avatars from "../avatars.js";
import type * as cliprJobs from "../cliprJobs.js";
import type * as cliprPreferences from "../cliprPreferences.js";
import type * as longrVideos from "../longrVideos.js";
import type * as photoAssets from "../photoAssets.js";
import type * as products from "../products.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as rateLimits from "../rateLimits.js";
import type * as replicateJobs from "../replicateJobs.js";
import type * as sharedMusicTracks from "../sharedMusicTracks.js";
import type * as stitches from "../stitches.js";
import type * as swipes from "../swipes.js";
import type * as swiprBackgrounds from "../swiprBackgrounds.js";
import type * as validators_assetTags from "../validators/assetTags.js";
import type * as validators_avatarWardrobeStyle from "../validators/avatarWardrobeStyle.js";
import type * as validators_clipType from "../validators/clipType.js";
import type * as validators_cliprDurationSeconds from "../validators/cliprDurationSeconds.js";
import type * as validators_cliprJobStage from "../validators/cliprJobStage.js";
import type * as validators_cliprJobStatus from "../validators/cliprJobStatus.js";
import type * as validators_cliprMetadata from "../validators/cliprMetadata.js";
import type * as validators_cliprMusicMetadata from "../validators/cliprMusicMetadata.js";
import type * as validators_cliprScenePlan from "../validators/cliprScenePlan.js";
import type * as validators_longrClipSegment from "../validators/longrClipSegment.js";
import type * as validators_longrMusicClip from "../validators/longrMusicClip.js";
import type * as validators_musicTrackSource from "../validators/musicTrackSource.js";
import type * as validators_r2Object from "../validators/r2Object.js";
import type * as validators_replicateJobPurpose from "../validators/replicateJobPurpose.js";
import type * as validators_replicatePredictionStatus from "../validators/replicatePredictionStatus.js";
import type * as validators_stitchMusicMetadata from "../validators/stitchMusicMetadata.js";
import type * as validators_swaprMetadata from "../validators/swaprMetadata.js";
import type * as validators_swiprBackgroundSource from "../validators/swiprBackgroundSource.js";
import type * as validators_swiprProductSourceType from "../validators/swiprProductSourceType.js";
import type * as validators_swiprSlide from "../validators/swiprSlide.js";
import type * as validators_textOverlay from "../validators/textOverlay.js";
import type * as validators_videoTrimRange from "../validators/videoTrimRange.js";
import type * as videoClips from "../videoClips.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "auth/assertRateLimitApiSecret": typeof auth_assertRateLimitApiSecret;
  "auth/getAuthenticatedOwnerId": typeof auth_getAuthenticatedOwnerId;
  avatars: typeof avatars;
  cliprJobs: typeof cliprJobs;
  cliprPreferences: typeof cliprPreferences;
  longrVideos: typeof longrVideos;
  photoAssets: typeof photoAssets;
  products: typeof products;
  rateLimiter: typeof rateLimiter;
  rateLimits: typeof rateLimits;
  replicateJobs: typeof replicateJobs;
  sharedMusicTracks: typeof sharedMusicTracks;
  stitches: typeof stitches;
  swipes: typeof swipes;
  swiprBackgrounds: typeof swiprBackgrounds;
  "validators/assetTags": typeof validators_assetTags;
  "validators/avatarWardrobeStyle": typeof validators_avatarWardrobeStyle;
  "validators/clipType": typeof validators_clipType;
  "validators/cliprDurationSeconds": typeof validators_cliprDurationSeconds;
  "validators/cliprJobStage": typeof validators_cliprJobStage;
  "validators/cliprJobStatus": typeof validators_cliprJobStatus;
  "validators/cliprMetadata": typeof validators_cliprMetadata;
  "validators/cliprMusicMetadata": typeof validators_cliprMusicMetadata;
  "validators/cliprScenePlan": typeof validators_cliprScenePlan;
  "validators/longrClipSegment": typeof validators_longrClipSegment;
  "validators/longrMusicClip": typeof validators_longrMusicClip;
  "validators/musicTrackSource": typeof validators_musicTrackSource;
  "validators/r2Object": typeof validators_r2Object;
  "validators/replicateJobPurpose": typeof validators_replicateJobPurpose;
  "validators/replicatePredictionStatus": typeof validators_replicatePredictionStatus;
  "validators/stitchMusicMetadata": typeof validators_stitchMusicMetadata;
  "validators/swaprMetadata": typeof validators_swaprMetadata;
  "validators/swiprBackgroundSource": typeof validators_swiprBackgroundSource;
  "validators/swiprProductSourceType": typeof validators_swiprProductSourceType;
  "validators/swiprSlide": typeof validators_swiprSlide;
  "validators/textOverlay": typeof validators_textOverlay;
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
};
