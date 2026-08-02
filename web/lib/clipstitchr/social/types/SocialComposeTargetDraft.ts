import type { SocialPlatform } from "./SocialPlatform";

export type SocialComposeTargetDraft = {
  accountId: string;
  platform: SocialPlatform;
  publishMode: "direct" | "draft";
  privacyLevel: string;
  allowComment: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  autoAddMusic: boolean;
  brandContentToggle: boolean;
  brandOrganicToggle: boolean;
  commercialContentEnabled: boolean;
  shareToFeed: boolean;
};
