export const PUBLIC_PUBLISHING_PROVIDERS = ["instagram", "tiktok"] as const;

export type PublicPublishingProvider =
  (typeof PUBLIC_PUBLISHING_PROVIDERS)[number];
