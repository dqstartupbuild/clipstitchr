import { PublishingProviderDisabledError } from "../errors/PublishingProviderDisabledError.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { PublishingIntegrationRuntime } from "./PublishingIntegrationRuntime.js";
import type { PublicPublishingProvider } from "./PublicPublishingProvider.js";

export const selectPublishingIntegrationRuntime = (
  runtimes: ReadonlyMap<PublishingProvider, PublishingIntegrationRuntime>,
  provider: PublicPublishingProvider,
): PublishingIntegrationRuntime => {
  if (provider === "instagram") {
    const standalone = runtimes.get("instagram-standalone");
    if (standalone?.id === "instagram-standalone") {
      return standalone;
    }

    const facebook = runtimes.get("instagram");
    if (facebook?.id === "instagram") {
      return facebook;
    }

    throw new PublishingProviderDisabledError();
  }

  const runtime = runtimes.get("tiktok");

  if (runtime?.id !== "tiktok") {
    throw new PublishingProviderDisabledError();
  }

  return runtime;
};
