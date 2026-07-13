export class ToolLeadRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("Invalid tool lead request.");
    this.name = "ToolLeadRequestError";
    this.status = status;
  }
}
