export const PUBLISHING_PROVIDERS = [
  "instagram",
  "instagram-standalone",
  "tiktok",
] as const;

export type PublishingProvider = (typeof PUBLISHING_PROVIDERS)[number];
