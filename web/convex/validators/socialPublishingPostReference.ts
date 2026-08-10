import { v } from "convex/values";
import { socialPublishingMediaKindValidator } from "./socialPublishingMediaKind";
import { socialPublishingPlatformValidator } from "./socialPublishingPlatform";
import { socialPublishingPostStatusValidator } from "./socialPublishingPostStatus";
import { socialPublishingSourceTypeValidator } from "./socialPublishingSourceType";

export const socialPublishingPostReferenceValidator = v.object({
  createdAt: v.string(),
  hasAudio: v.boolean(),
  isDraft: v.optional(v.boolean()),
  mediaIds: v.array(v.string()),
  mediaKind: socialPublishingMediaKindValidator,
  platforms: v.array(socialPublishingPlatformValidator),
  postId: v.string(),
  scheduledAt: v.optional(v.string()),
  socialAccountIds: v.array(v.string()),
  sourceType: socialPublishingSourceTypeValidator,
  status: socialPublishingPostStatusValidator,
  updatedAt: v.string(),
});
