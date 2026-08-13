export class PublishingProxyRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.name = "PublishingProxyRequestError";
    this.status = status;
    this.code = code;
  }
}
