import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";

export type StoredProviderPublishResult = Readonly<{
  provider: PublishingProvider;
  kind: ProviderPublishResult["kind"];
  providerOperationId: string | null;
  remotePostIds: readonly string[];
  remoteUrls: readonly string[];
  visibility: string | null;
}>;
