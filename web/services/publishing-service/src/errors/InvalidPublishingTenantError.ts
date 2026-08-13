export class InvalidPublishingTenantError extends Error {
  constructor() {
    super("Publishing tenant identity is invalid.");
    this.name = "InvalidPublishingTenantError";
  }
}
