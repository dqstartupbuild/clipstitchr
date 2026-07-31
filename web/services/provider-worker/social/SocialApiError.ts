export class SocialApiError extends Error {
  readonly providerCode?: string;
  readonly responseBody: string;
  readonly responseStatus: number;
  readonly retryAfterMs?: number;

  constructor(
    message: string,
    responseStatus: number,
    responseBody: string,
    retryAfterMs?: number,
    providerCode?: string,
  ) {
    super(message);
    this.name = "SocialApiError";
    this.providerCode = providerCode;
    this.responseStatus = responseStatus;
    this.responseBody = responseBody;
    this.retryAfterMs = retryAfterMs;
  }
}
