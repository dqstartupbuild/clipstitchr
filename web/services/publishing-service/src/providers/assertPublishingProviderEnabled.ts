import { PublishingProviderDisabledError } from "../errors/PublishingProviderDisabledError.js";
import type { PublishingProvider } from "./PublishingProvider.js";
import { isPublishingProvider } from "./isPublishingProvider.js";

export const assertPublishingProviderEnabled = (
  enabledProviders: readonly PublishingProvider[],
  provider: PublishingProvider,
): void => {
  if (!isPublishingProvider(provider) || !enabledProviders.includes(provider)) {
    throw new PublishingProviderDisabledError();
  }
};
