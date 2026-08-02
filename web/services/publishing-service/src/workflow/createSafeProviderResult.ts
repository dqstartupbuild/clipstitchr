import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";

export const createSafeProviderResult = (
  provider: PublishingProvider,
  kind: Extract<
    ProviderPublishResult["kind"],
    "outcome_unknown" | "rejected" | "requires_user_action"
  >,
  providerOperationId?: string,
): ProviderPublishResult =>
  Object.freeze({
    provider,
    kind,
    providerOperationId,
    remotePostIds: Object.freeze([]),
    remoteUrls: Object.freeze([]),
    visibility: undefined,
  });
