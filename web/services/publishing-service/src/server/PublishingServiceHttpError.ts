export class PublishingServiceHttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfterSeconds: number | undefined;

  constructor(status: number, code: string, retryAfterSeconds?: number) {
    super(code);
    this.name = "PublishingServiceHttpError";
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
