import {
  APIError,
  RateLimitExceededError,
  ValidationError,
} from "loops";
import type { EmailProviderRetryDecision } from "./EmailProviderRetryDecision";
import type { EmailProviderDispatchProjection } from "./EmailProviderDispatchProjection";

const MAX_PROVIDER_ATTEMPTS = 7;

export function getEmailProviderRetryDecision(
  error: unknown,
  options: Readonly<{
    acceptanceUnknown: boolean;
    attemptCount: number;
    idempotencyExpiresAt: number;
    now: number;
    operationKind: EmailProviderDispatchProjection["operation"]["kind"];
  }>,
): EmailProviderRetryDecision {
  if (
    options.operationKind === "contactDelete" &&
    error instanceof APIError &&
    error.statusCode === 404
  ) {
    return { outcome: "accepted", reason: "already-deleted" };
  }

  if (error instanceof APIError && error.statusCode === 409) {
    return options.operationKind === "workflowEvent" ||
      options.operationKind === "transactional"
      ? { outcome: "accepted", reason: "duplicate-idempotency-key" }
      : { outcome: "dead-letter", reason: "provider-rejected" };
  }

  if (error instanceof ValidationError) {
    return { outcome: "dead-letter", reason: "invalid-request" };
  }

  const retryReason =
    error instanceof RateLimitExceededError ||
    (error instanceof APIError && error.statusCode === 429)
      ? "provider-rate-limit"
      : error instanceof APIError && error.statusCode >= 500
        ? "provider-unavailable"
        : error instanceof APIError
          ? null
          : "network";

  if (!retryReason) {
    return { outcome: "dead-letter", reason: "provider-rejected" };
  }

  if (
    options.operationKind !== "contactDelete" &&
    options.acceptanceUnknown &&
    options.now >= options.idempotencyExpiresAt
  ) {
    return { outcome: "dead-letter", reason: "ambiguous-outcome-expired" };
  }

  if (options.attemptCount >= MAX_PROVIDER_ATTEMPTS) {
    return { outcome: "dead-letter", reason: "attempt-limit" };
  }

  return { outcome: "retry", reason: retryReason };
}
