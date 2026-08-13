import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";
import type { StoredProviderPublishResult } from "./StoredProviderPublishResult.js";

export const encodeProviderPublishResult = (
  result: ProviderPublishResult,
): StoredProviderPublishResult =>
  Object.freeze({
    provider: result.provider,
    kind: result.kind,
    providerOperationId: result.providerOperationId ?? null,
    remotePostIds: Object.freeze([...result.remotePostIds]),
    remoteUrls: Object.freeze([...result.remoteUrls]),
    visibility: result.visibility ?? null,
  });
