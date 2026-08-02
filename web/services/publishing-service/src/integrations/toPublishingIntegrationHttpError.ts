import { OAuthAuthorizationStateError } from "../errors/OAuthAuthorizationStateError.js";
import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import { PublishingProviderDisabledError } from "../errors/PublishingProviderDisabledError.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import { PublishingTenantNotFoundError } from "../errors/PublishingTenantNotFoundError.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

export const toPublishingIntegrationHttpError = (
  error: unknown,
): unknown => {
  if (error instanceof PublishingServiceHttpError) {
    return error;
  }

  if (error instanceof PublishingProviderDisabledError) {
    return new PublishingServiceHttpError(404, "provider_unavailable");
  }

  if (
    error instanceof PublishingResourceOwnershipError ||
    error instanceof PublishingTenantNotFoundError
  ) {
    return new PublishingServiceHttpError(404, "integration_not_found");
  }

  if (error instanceof OAuthAuthorizationStateError) {
    return new PublishingServiceHttpError(
      error.reason === "storage" || error.reason === "configuration" ? 503 : 400,
      error.reason === "storage" || error.reason === "configuration"
        ? "authorization_unavailable"
        : "authorization_failed",
    );
  }

  if (error instanceof PublishingPersistenceValidationError) {
    return new PublishingServiceHttpError(400, "invalid_request");
  }

  if (error instanceof ProviderRuntimeError) {
    switch (error.code) {
      case "auth_required":
        return new PublishingServiceHttpError(409, "reconnect_required");
      case "invalid_request":
      case "rejected":
        return new PublishingServiceHttpError(400, "provider_rejected");
      case "invalid_response":
        return new PublishingServiceHttpError(502, "provider_invalid_response");
      case "rate_limited":
        return new PublishingServiceHttpError(
          429,
          "provider_rate_limited",
          error.retryAfterSeconds !== undefined &&
            Number.isSafeInteger(error.retryAfterSeconds) &&
            error.retryAfterSeconds >= 1 &&
            error.retryAfterSeconds <= 86_400
            ? error.retryAfterSeconds
            : undefined,
        );
      case "invalid_configuration":
      case "network":
      case "transient_failure":
        return new PublishingServiceHttpError(503, "provider_unavailable");
    }
  }

  return error;
};
