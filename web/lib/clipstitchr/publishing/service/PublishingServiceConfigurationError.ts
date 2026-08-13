export class PublishingServiceConfigurationError extends Error {
  constructor() {
    super("Publishing is not configured for this environment.");
    this.name = "PublishingServiceConfigurationError";
  }
}
