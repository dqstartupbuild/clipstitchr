export class PublishingProviderDisabledError extends Error {
  constructor() {
    super("Publishing provider is not enabled.");
    this.name = "PublishingProviderDisabledError";
  }
}
