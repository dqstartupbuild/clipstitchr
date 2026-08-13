import type { TikTokCreatorInfo } from "../provider-runtime/tiktok/TikTokCreatorInfo.js";
import type { TikTokPublishRequest } from "../provider-runtime/tiktok/TikTokPublishRequest.js";
import type { PublishingWorkflowMediaGrant } from "./PublishingWorkflowMediaGrant.js";
import type { PublishingWorkflowWorkItem } from "./PublishingWorkflowWorkItem.js";
import { createTikTokMedia } from "./createTikTokMedia.js";

export const createTikTokPublishRequest = (
  item: PublishingWorkflowWorkItem,
  accessToken: string,
  grants: readonly PublishingWorkflowMediaGrant[],
  creatorInfo: TikTokCreatorInfo | undefined,
): TikTokPublishRequest => {
  if (item.settings.provider !== "tiktok") {
    throw new TypeError("TikTok destination settings are required.");
  }
  const direct = item.settings.mode === "direct";

  return Object.freeze({
    accessToken,
    grantedScopes: Object.freeze([...item.grantedScopes]),
    mode: item.settings.mode,
    media: createTikTokMedia(item, grants),
    caption: item.caption,
    photoTitle: undefined,
    privacyLevel: direct ? item.settings.privacyLevel : undefined,
    allowComment: direct ? item.settings.allowComment : undefined,
    allowDuet: direct ? item.settings.allowDuet : undefined,
    allowStitch: direct ? item.settings.allowStitch : undefined,
    isAigc: direct ? item.settings.isAigc : false,
    brandContent: direct ? item.settings.brandContent : false,
    brandOrganic: direct ? item.settings.brandOrganic : false,
    autoAddMusic: direct ? item.settings.autoAddMusic : false,
    creatorInfo,
    consentConfirmed: direct && item.settings.consentConfirmed,
  });
};
