export class SocialOutcomeUnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SocialOutcomeUnknownError";
  }
}
