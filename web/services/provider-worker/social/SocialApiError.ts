export class SocialApiError extends Error {
  readonly responseBody: string;
  readonly responseStatus: number;
  readonly retryAfterMs?: number;

  constructor(
    message: string,
    responseStatus: number,
    responseBody: string,
    retryAfterMs?: number,
  ) {
    super(message);
    this.name = "SocialApiError";
    this.responseStatus = responseStatus;
    this.responseBody = responseBody;
    this.retryAfterMs = retryAfterMs;
  }
}
