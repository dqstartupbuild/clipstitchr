import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";

type SocialPublishingTikTokCreatorInfo = {
  creator: {
    canPostMore: boolean;
  };
  privacyLevels: {
    label: string;
    value: string;
  }[];
};

export async function getSocialPublishingTikTokCreatorInfo(
  apiKey: string,
  accountId: string,
) {
  return await requestSocialPublishing<SocialPublishingTikTokCreatorInfo>(
    `/v1/accounts/${encodeURIComponent(accountId)}/tiktok/creator-info`,
    {
      apiKey,
      query: new URLSearchParams({ mediaType: "video" }),
    },
  );
}
