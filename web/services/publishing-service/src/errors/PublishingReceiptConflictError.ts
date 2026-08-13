export class PublishingReceiptConflictError extends Error {
  public constructor() {
    super("A different immutable provider receipt already records this result.");
    this.name = "PublishingReceiptConflictError";
  }
}
