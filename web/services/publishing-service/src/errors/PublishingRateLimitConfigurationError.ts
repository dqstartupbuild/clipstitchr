export class PublishingRateLimitConfigurationError extends Error {
  constructor() {
    super("Publishing rate-limit configuration is invalid.");
    this.name = "PublishingRateLimitConfigurationError";
  }
}
