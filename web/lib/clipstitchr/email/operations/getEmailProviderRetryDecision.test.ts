import {
  APIError,
  RateLimitExceededError,
  ValidationError,
} from "loops";
import { describe, expect, it } from "vitest";
import { getEmailProviderRetryDecision } from "@/lib/clipstitchr/email/operations/getEmailProviderRetryDecision";

const createdAt = Date.UTC(2026, 6, 13, 12);
const idempotencyExpiresAt = createdAt + 24 * 60 * 60 * 1_000;

describe("getEmailProviderRetryDecision", () => {
  it("treats a duplicate idempotency response as accepted", () => {
    const error = new APIError(409, {
      success: false,
      message: "Duplicate idempotency key",
    });

    expect(
      getEmailProviderRetryDecision(error, {
        acceptanceUnknown: false,
        attemptCount: 2,
        now: createdAt + 1_000,
        idempotencyExpiresAt,
        operationKind: "transactional",
      }),
    ).toEqual({ outcome: "accepted", reason: "duplicate-idempotency-key" });
  });

  it("does not treat a contact-update conflict as provider acceptance", () => {
    const error = new APIError(409, {
      success: false,
      message: "Contact update conflict",
    });

    expect(
      getEmailProviderRetryDecision(error, {
        acceptanceUnknown: false,
        attemptCount: 1,
        now: createdAt + 1_000,
        idempotencyExpiresAt,
        operationKind: "contactSync",
      }),
    ).toEqual({ outcome: "dead-letter", reason: "provider-rejected" });
  });

  it("retries provider and transport failures only inside the idempotency window", () => {
    expect(
      getEmailProviderRetryDecision(
        new RateLimitExceededError(10, 0),
        {
          acceptanceUnknown: false,
          attemptCount: 1,
          now: createdAt + 60_000,
          idempotencyExpiresAt,
          operationKind: "workflowEvent",
        },
      ),
    ).toEqual({ outcome: "retry", reason: "provider-rate-limit" });

    expect(
      getEmailProviderRetryDecision(
        new Error("connection reset"),
        {
          acceptanceUnknown: true,
          attemptCount: 1,
          now: createdAt + 24 * 60 * 60 * 1_000,
          idempotencyExpiresAt,
          operationKind: "workflowEvent",
        },
      ),
    ).toEqual({
      outcome: "dead-letter",
      reason: "ambiguous-outcome-expired",
    });
  });

  it("keeps an explicit rate limit retryable after the idempotency window", () => {
    expect(
      getEmailProviderRetryDecision(new APIError(429, null), {
        acceptanceUnknown: false,
        attemptCount: 2,
        now: createdAt + 25 * 60 * 60 * 1_000,
        idempotencyExpiresAt,
        operationKind: "transactional",
      }),
    ).toEqual({ outcome: "retry", reason: "provider-rate-limit" });
  });

  it("dead-letters invalid requests and exhausted retries", () => {
    expect(
      getEmailProviderRetryDecision(
        new ValidationError("invalid payload"),
        {
          acceptanceUnknown: false,
          attemptCount: 1,
          now: createdAt + 1_000,
          idempotencyExpiresAt,
          operationKind: "transactional",
        },
      ),
    ).toEqual({ outcome: "dead-letter", reason: "invalid-request" });

    expect(
      getEmailProviderRetryDecision(
        new APIError(503, null),
        {
          acceptanceUnknown: true,
          attemptCount: 7,
          now: createdAt + 1_000,
          idempotencyExpiresAt,
          operationKind: "workflowEvent",
        },
      ),
    ).toEqual({ outcome: "dead-letter", reason: "attempt-limit" });
  });
});
