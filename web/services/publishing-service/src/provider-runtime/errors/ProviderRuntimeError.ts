import type { PublishingProvider } from "../../providers/PublishingProvider.js";

export type ProviderRuntimeErrorCode =
  | "auth_required"
  | "invalid_configuration"
  | "invalid_request"
  | "invalid_response"
  | "network"
  | "rate_limited"
  | "rejected"
  | "transient_failure";

export class ProviderRuntimeError extends Error {
  readonly provider: PublishingProvider;
  readonly code: ProviderRuntimeErrorCode;
  readonly retryable: boolean;
  readonly retryAfterSeconds: number | undefined;

  constructor(
    provider: PublishingProvider,
    code: ProviderRuntimeErrorCode,
    retryable = false,
    retryAfterSeconds?: number,
  ) {
    super(`The ${provider} provider request could not be completed (${code}).`);
    this.name = "ProviderRuntimeError";
    this.provider = provider;
    this.code = code;
    this.retryable = retryable;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
