import type { PublishingProvider } from "../providers/PublishingProvider.js";

export const readPublishingMediaGrantValiditySeconds = (
  provider: PublishingProvider,
): number =>
  provider === "tiktok" || provider === "youtube" ? 4_500 : 900;
