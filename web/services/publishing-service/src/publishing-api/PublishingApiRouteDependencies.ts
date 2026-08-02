import type { PublishingProviderRuntime } from "../provider-runtime/registry/PublishingProviderRuntime.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { PublishingApiStore } from "./PublishingApiStore.js";

export type PublishingApiRouteDependencies = Readonly<{
  now?: () => Date;
  providerRuntimes: ReadonlyMap<PublishingProvider, PublishingProviderRuntime>;
  store: PublishingApiStore;
}>;
