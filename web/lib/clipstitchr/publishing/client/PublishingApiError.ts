export class PublishingApiError extends Error {
  readonly code: string;
  readonly retryAfterSeconds: number | null;
  readonly status: number;

  constructor(options: {
    code: string;
    message: string;
    retryAfterSeconds?: number | null;
    status: number;
  }) {
    super(options.message);
    this.code = options.code;
    this.name = "PublishingApiError";
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
    this.status = options.status;
  }
}
