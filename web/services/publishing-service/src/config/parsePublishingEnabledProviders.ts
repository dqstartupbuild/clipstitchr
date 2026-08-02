import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import { isPublishingProvider } from "../providers/isPublishingProvider.js";
import type { PublishingServiceRuntimeMode } from "./PublishingServiceRuntimeMode.js";

export const parsePublishingEnabledProviders = (
  value: string | undefined,
  mode: PublishingServiceRuntimeMode,
): readonly PublishingProvider[] => {
  if (value === undefined) {
    if (mode === "production") {
      throw new PublishingServiceConfigurationError(
        "PUBLISHING_ENABLED_PROVIDERS",
      );
    }

    return Object.freeze([]);
  }

  const entries = value.split(",").map((entry) => entry.trim());

  if (
    entries.length === 0 ||
    entries.some((entry) => !isPublishingProvider(entry)) ||
    new Set(entries).size !== entries.length
  ) {
    throw new PublishingServiceConfigurationError(
      "PUBLISHING_ENABLED_PROVIDERS",
    );
  }

  const providers = entries as PublishingProvider[];

  if (
    mode === "production" &&
    (!providers.includes("tiktok") ||
      (!providers.includes("instagram") &&
        !providers.includes("instagram-standalone")))
  ) {
    throw new PublishingServiceConfigurationError(
      "PUBLISHING_ENABLED_PROVIDERS",
    );
  }

  return Object.freeze([...providers]);
};
