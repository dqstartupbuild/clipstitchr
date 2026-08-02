import { v } from "convex/values";
import { postBridgeMediaKindValidator } from "./postBridgeMediaKind";
import { postBridgePlatformValidator } from "./postBridgePlatform";
import { postBridgePostStatusValidator } from "./postBridgePostStatus";
import { postBridgeSourceTypeValidator } from "./postBridgeSourceType";

export const postBridgePostReferenceValidator = v.object({
  createdAt: v.string(),
  hasAudio: v.boolean(),
  isDraft: v.optional(v.boolean()),
  mediaIds: v.array(v.string()),
  mediaKind: postBridgeMediaKindValidator,
  platforms: v.array(postBridgePlatformValidator),
  postId: v.string(),
  scheduledAt: v.optional(v.string()),
  socialAccountIds: v.array(v.number()),
  sourceType: postBridgeSourceTypeValidator,
  status: postBridgePostStatusValidator,
  updatedAt: v.string(),
});
