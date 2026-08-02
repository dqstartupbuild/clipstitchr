export class PublishingMediaRevisionConflictError extends Error {
  public constructor() {
    super("The immutable media revision is already bound to different bytes.");
    this.name = "PublishingMediaRevisionConflictError";
  }
}
