export class PublishingServiceConfigurationError extends Error {
  readonly field: string;

  constructor(field: string) {
    super(`Invalid or missing publishing service configuration: ${field}.`);
    this.name = "PublishingServiceConfigurationError";
    this.field = field;
  }
}
