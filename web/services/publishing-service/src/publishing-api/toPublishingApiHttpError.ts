import { InvalidPublishingScheduleError } from "../errors/InvalidPublishingScheduleError.js";
import { PublishingIdempotencyConflictError } from "../errors/PublishingIdempotencyConflictError.js";
import { PublishingMediaRevisionConflictError } from "../errors/PublishingMediaRevisionConflictError.js";
import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import { PublishingProviderDisabledError } from "../errors/PublishingProviderDisabledError.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import { PublishingTenantNotFoundError } from "../errors/PublishingTenantNotFoundError.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import { PublishingApiConflictError } from "./PublishingApiConflictError.js";

export const toPublishingApiHttpError = (error: unknown): unknown => {
  if (error instanceof PublishingServiceHttpError) {
    return error;
  }
  if (
    error instanceof PublishingResourceOwnershipError ||
    error instanceof PublishingTenantNotFoundError
  ) {
    return new PublishingServiceHttpError(404, "resource_not_found");
  }
  if (error instanceof PublishingApiConflictError) {
    return new PublishingServiceHttpError(409, error.code);
  }
  if (error instanceof PublishingIdempotencyConflictError) {
    return new PublishingServiceHttpError(409, "idempotency_conflict");
  }
  if (error instanceof PublishingMediaRevisionConflictError) {
    return new PublishingServiceHttpError(409, "stale_media_revision");
  }
  if (error instanceof PublishingProviderDisabledError) {
    return new PublishingServiceHttpError(409, "provider_unavailable");
  }
  if (
    error instanceof InvalidPublishingScheduleError ||
    error instanceof PublishingPersistenceValidationError
  ) {
    return new PublishingServiceHttpError(400, "invalid_request");
  }
  if (error instanceof ProviderRuntimeError) {
    switch (error.code) {
      case "auth_required":
        return new PublishingServiceHttpError(409, "connection_needs_attention");
      case "invalid_request":
      case "rejected":
        return new PublishingServiceHttpError(400, "provider_rejected_request");
      case "invalid_response":
        return new PublishingServiceHttpError(502, "provider_invalid_response");
      case "rate_limited":
        return new PublishingServiceHttpError(
          429,
          "provider_rate_limited",
          error.retryAfterSeconds,
        );
      case "invalid_configuration":
      case "network":
      case "transient_failure":
        return new PublishingServiceHttpError(503, "provider_unavailable");
    }
  }
  return error;
};
