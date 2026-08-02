import type { PublishingRateLimitAction } from "../rate-limits/PublishingRateLimitAction.js";

export class PublishingRateLimitExceededError extends Error {
  readonly action: PublishingRateLimitAction;
  readonly retryAfterSeconds: number;

  constructor(action: PublishingRateLimitAction, retryAfterSeconds: number) {
    super("Too many publishing requests. Try again shortly.");
    this.name = "PublishingRateLimitExceededError";
    this.action = action;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
