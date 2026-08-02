import type { PublishingProvider } from "../providers/PublishingProvider.js";

export const readPublishingMediaGrantValiditySeconds = (
  provider: PublishingProvider,
): number => (provider === "tiktok" ? 4_500 : 900);
