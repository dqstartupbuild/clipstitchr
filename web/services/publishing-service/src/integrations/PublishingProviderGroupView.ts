import type { PublishingIntegrationView } from "./PublishingIntegrationView.js";
import type { PublicPublishingProvider } from "./PublicPublishingProvider.js";

export type PublishingProviderGroupView = Readonly<{
  canConnect: boolean;
  integrations: readonly PublishingIntegrationView[];
  provider: PublicPublishingProvider;
  unavailableReason: string | null;
}>;
