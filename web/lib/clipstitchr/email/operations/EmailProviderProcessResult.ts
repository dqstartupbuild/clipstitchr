export type EmailProviderProcessResult =
  | Readonly<{ processed: true }>
  | Readonly<{
      processed: false;
      reason:
        | "acceptance-raced"
        | "ambiguous"
        | "attempt-not-started"
        | "compensation-queued"
        | "configuration"
        | "ineligible"
        | "invalidRequest"
        | "network"
        | "not-claimable"
        | "not-ready"
        | "provider-disabled"
        | "provider-rate-limited"
        | "providerUnavailable"
        | "rateLimited"
        | "retryLimit";
    }>;
