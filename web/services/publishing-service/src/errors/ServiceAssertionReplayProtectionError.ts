export class ServiceAssertionReplayProtectionError extends Error {
  constructor() {
    super("Service assertion replay protection is unavailable.");
    this.name = "ServiceAssertionReplayProtectionError";
  }
}
