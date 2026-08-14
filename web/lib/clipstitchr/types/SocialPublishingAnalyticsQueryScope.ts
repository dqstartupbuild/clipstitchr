export type SocialPublishingAnalyticsQueryScope =
  | { accountId: string; profileId?: never }
  | { accountId?: never; profileId: string };
