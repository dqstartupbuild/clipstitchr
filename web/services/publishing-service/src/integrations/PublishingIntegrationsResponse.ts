import type { PublishingProviderGroupView } from "./PublishingProviderGroupView.js";

export type PublishingIntegrationsResponse = Readonly<{
  providers: readonly PublishingProviderGroupView[];
}>;
