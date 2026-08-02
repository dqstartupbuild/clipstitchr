export type ProviderTokenEnvelopeFailureReason =
  | "invalid-key"
  | "malformed"
  | "unsupported-version"
  | "unknown-key"
  | "authentication";

export class ProviderTokenEnvelopeError extends Error {
  readonly reason: ProviderTokenEnvelopeFailureReason;

  constructor(reason: ProviderTokenEnvelopeFailureReason) {
    super(`Provider token envelope rejected: ${reason}.`);
    this.name = "ProviderTokenEnvelopeError";
    this.reason = reason;
  }
}
