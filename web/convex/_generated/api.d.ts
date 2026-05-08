/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_getAuthenticatedOwnerId from "../auth/getAuthenticatedOwnerId.js";
import type * as photoAssets from "../photoAssets.js";
import type * as stitches from "../stitches.js";
import type * as validators_assetTags from "../validators/assetTags.js";
import type * as validators_clipType from "../validators/clipType.js";
import type * as validators_r2Object from "../validators/r2Object.js";
import type * as validators_swaprMetadata from "../validators/swaprMetadata.js";
import type * as validators_textOverlay from "../validators/textOverlay.js";
import type * as validators_videoTrimRange from "../validators/videoTrimRange.js";
import type * as videoClips from "../videoClips.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "auth/getAuthenticatedOwnerId": typeof auth_getAuthenticatedOwnerId;
  photoAssets: typeof photoAssets;
  stitches: typeof stitches;
  "validators/assetTags": typeof validators_assetTags;
  "validators/clipType": typeof validators_clipType;
  "validators/r2Object": typeof validators_r2Object;
  "validators/swaprMetadata": typeof validators_swaprMetadata;
  "validators/textOverlay": typeof validators_textOverlay;
  "validators/videoTrimRange": typeof validators_videoTrimRange;
  videoClips: typeof videoClips;
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

export declare const components: {};
