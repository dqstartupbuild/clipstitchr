import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import { createSafeProviderResult } from "./createSafeProviderResult.js";

export const mapProviderRuntimeErrorResult = (
  provider: PublishingProvider,
  error: unknown,
): ProviderPublishResult | null => {
  if (!(error instanceof ProviderRuntimeError)) {
    return createSafeProviderResult(provider, "outcome_unknown");
  }

  switch (error.code) {
    case "auth_required":
      return createSafeProviderResult(provider, "requires_user_action");
    case "invalid_configuration":
    case "invalid_request":
    case "rejected":
      return createSafeProviderResult(provider, "rejected");
    case "invalid_response":
    case "network":
    case "transient_failure":
      return createSafeProviderResult(provider, "outcome_unknown");
    case "rate_limited":
      return null;
  }
};
