export type OAuthAuthorizationStateFailureReason =
  | "configuration"
  | "invalid"
  | "storage"
  | "unavailable"
  | "expired"
  | "binding";

export class OAuthAuthorizationStateError extends Error {
  readonly reason: OAuthAuthorizationStateFailureReason;

  constructor(reason: OAuthAuthorizationStateFailureReason) {
    super(`OAuth authorization state rejected: ${reason}.`);
    this.name = "OAuthAuthorizationStateError";
    this.reason = reason;
  }
}
