import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";
import type { StoredProviderPublishResult } from "./StoredProviderPublishResult.js";

const RESULT_KINDS = new Set<ProviderPublishResult["kind"]>([
  "accepted",
  "media_transfer_pending",
  "processing",
  "requires_user_action",
  "published",
  "published_not_public",
  "rejected",
  "outcome_unknown",
]);

export const decodeProviderPublishResult = (
  value: unknown,
): ProviderPublishResult => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ProviderRuntimeError("instagram", "invalid_request");
  }
  const result = value as Partial<StoredProviderPublishResult>;

  if (
    (result.provider !== "instagram" &&
      result.provider !== "instagram-standalone" &&
      result.provider !== "tiktok") ||
    typeof result.kind !== "string" ||
    !RESULT_KINDS.has(result.kind as ProviderPublishResult["kind"]) ||
    (result.providerOperationId !== null &&
      typeof result.providerOperationId !== "string") ||
    !Array.isArray(result.remotePostIds) ||
    !result.remotePostIds.every((id) => typeof id === "string") ||
    !Array.isArray(result.remoteUrls) ||
    !result.remoteUrls.every((url) => typeof url === "string") ||
    (result.visibility !== null && typeof result.visibility !== "string")
  ) {
    throw new ProviderRuntimeError("instagram", "invalid_request");
  }

  return Object.freeze({
    provider: result.provider,
    kind: result.kind as ProviderPublishResult["kind"],
    providerOperationId: result.providerOperationId ?? undefined,
    remotePostIds: Object.freeze([...result.remotePostIds]),
    remoteUrls: Object.freeze([...result.remoteUrls]),
    visibility: result.visibility ?? undefined,
  });
};
