export class PublishingMediaGatewayRangeError extends Error {
  constructor() {
    super("The requested byte range is not available.");
    this.name = "PublishingMediaGatewayRangeError";
  }
}
