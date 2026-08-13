export class StudioBetaApiAccessError extends Error {
  readonly status: 401 | 403;

  constructor(status: 401 | 403) {
    super(
      status === 401
        ? "Authentication required."
        : "Studio Beta access is unavailable.",
    );
    this.name = "StudioBetaApiAccessError";
    this.status = status;
  }
}
