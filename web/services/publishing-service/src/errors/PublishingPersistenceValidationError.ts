export class PublishingPersistenceValidationError extends Error {
  public constructor(field: string) {
    super(`Invalid publishing persistence field: ${field}.`);
    this.name = "PublishingPersistenceValidationError";
  }
}
