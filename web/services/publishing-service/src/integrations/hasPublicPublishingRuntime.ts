import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { PublishingIntegrationRuntime } from "./PublishingIntegrationRuntime.js";
import type { PublicPublishingProvider } from "./PublicPublishingProvider.js";
import { selectPublishingIntegrationRuntime } from "./selectPublishingIntegrationRuntime.js";

export const hasPublicPublishingRuntime = (
  runtimes: ReadonlyMap<PublishingProvider, PublishingIntegrationRuntime>,
  provider: PublicPublishingProvider,
): boolean => {
  try {
    selectPublishingIntegrationRuntime(runtimes, provider);
    return true;
  } catch {
    return false;
  }
};
