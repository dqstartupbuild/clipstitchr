export class EmailProviderConfigurationError extends Error {
  constructor() {
    super("Email provider operation is not configured.");
    this.name = "EmailProviderConfigurationError";
  }
}
