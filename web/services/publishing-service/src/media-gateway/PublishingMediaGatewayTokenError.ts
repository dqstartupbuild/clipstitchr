export type PublishingMediaGatewayTokenErrorCode = "expired" | "invalid";

export class PublishingMediaGatewayTokenError extends Error {
  readonly code: PublishingMediaGatewayTokenErrorCode;

  constructor(code: PublishingMediaGatewayTokenErrorCode) {
    super("Publishing media grant is unavailable.");
    this.name = "PublishingMediaGatewayTokenError";
    this.code = code;
  }
}
