export class PublishingRedisUnavailableError extends Error {
  constructor() {
    super("Publishing Redis is unavailable.");
    this.name = "PublishingRedisUnavailableError";
  }
}
