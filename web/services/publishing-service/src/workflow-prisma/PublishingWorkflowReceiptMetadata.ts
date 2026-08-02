import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";

export type PublishingWorkflowReceiptMetadata = Readonly<{
  schemaVersion: 1;
  provider: PublishingProvider;
  providerResultKind: ProviderPublishResult["kind"];
  providerOperationId: string | null;
  visibility: string | null;
  remotePostCount: number;
  observableUrlCount: number;
}>;
