export class PublishingRateLimitStorageError extends Error {
  constructor() {
    super("Publishing rate-limit protection is unavailable.");
    this.name = "PublishingRateLimitStorageError";
  }
}
