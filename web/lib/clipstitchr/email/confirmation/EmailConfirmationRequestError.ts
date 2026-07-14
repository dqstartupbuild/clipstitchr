export class EmailConfirmationRequestError extends Error {
  constructor(readonly status: number) {
    super("Invalid email confirmation request.");
    this.name = "EmailConfirmationRequestError";
  }
}
