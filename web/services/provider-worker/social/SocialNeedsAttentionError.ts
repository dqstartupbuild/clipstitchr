export class SocialNeedsAttentionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SocialNeedsAttentionError";
  }
}
