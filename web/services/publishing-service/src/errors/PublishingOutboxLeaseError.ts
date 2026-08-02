export class PublishingOutboxLeaseError extends Error {
  public constructor() {
    super("The publishing outbox lease is no longer owned by this dispatcher.");
    this.name = "PublishingOutboxLeaseError";
  }
}
