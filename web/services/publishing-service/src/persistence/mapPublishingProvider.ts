import type { ClipPublishingProvider } from "@prisma/client";

import type { ProviderTokenProvider } from "../tokens/ProviderTokenProvider.js";

export const mapPublishingProvider = (
  provider: ProviderTokenProvider,
): ClipPublishingProvider => {
  switch (provider) {
    case "instagram":
      return "INSTAGRAM";
    case "instagram-standalone":
      return "INSTAGRAM_STANDALONE";
    case "tiktok":
      return "TIKTOK";
    case "youtube":
      return "YOUTUBE";
  }
};
