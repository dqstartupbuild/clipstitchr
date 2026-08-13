export class PublishingTenantNotFoundError extends Error {
  public constructor() {
    super("The publishing workspace is not available.");
    this.name = "PublishingTenantNotFoundError";
  }
}
