export class PublishingApiConflictError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = "PublishingApiConflictError";
    this.code = code;
  }
}
