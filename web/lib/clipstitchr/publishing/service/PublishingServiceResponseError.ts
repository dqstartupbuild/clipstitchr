export class PublishingServiceResponseError extends Error {
  readonly status: number;
  readonly retryAfterSeconds: number | undefined;

  constructor(status: number, retryAfterSeconds?: number) {
    super(
      status === 429
        ? "Publishing is busy right now. Try again in a moment."
        : "Publishing could not complete that request.",
    );
    this.name = "PublishingServiceResponseError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
