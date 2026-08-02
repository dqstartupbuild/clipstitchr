export type ServiceAssertionFailureReason =
  | "malformed"
  | "signature"
  | "claims"
  | "expired"
  | "binding"
  | "replayed";

export class InvalidServiceAssertionError extends Error {
  readonly reason: ServiceAssertionFailureReason;

  constructor(reason: ServiceAssertionFailureReason) {
    super(`Service assertion rejected: ${reason}.`);
    this.name = "InvalidServiceAssertionError";
    this.reason = reason;
  }
}
