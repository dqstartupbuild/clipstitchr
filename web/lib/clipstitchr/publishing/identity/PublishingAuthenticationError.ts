export class PublishingAuthenticationError extends Error {
  constructor() {
    super("Sign in to use publishing.");
    this.name = "PublishingAuthenticationError";
  }
}
