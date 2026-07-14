export type EmailProviderRetryDecision =
  | Readonly<{ outcome: "accepted"; reason: "duplicate-idempotency-key" }>
  | Readonly<{
      outcome: "retry";
      reason: "network" | "provider-rate-limit" | "provider-unavailable";
    }>
  | Readonly<{
      outcome: "dead-letter";
      reason:
        | "ambiguous-outcome-expired"
        | "attempt-limit"
        | "invalid-request"
        | "provider-rejected";
    }>;
