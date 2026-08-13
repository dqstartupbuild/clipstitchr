export class PublishingIdempotencyConflictError extends Error {
  public constructor() {
    super("The publishing idempotency key is already bound to another request.");
    this.name = "PublishingIdempotencyConflictError";
  }
}
