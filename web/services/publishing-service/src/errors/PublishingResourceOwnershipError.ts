export class PublishingResourceOwnershipError extends Error {
  public constructor() {
    super("The publishing resource is not available in this workspace.");
    this.name = "PublishingResourceOwnershipError";
  }
}
