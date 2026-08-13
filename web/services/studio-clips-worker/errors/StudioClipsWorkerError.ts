import type { StudioClipsFailureKind } from "../contracts/StudioClipsFailureKind";

export class StudioClipsWorkerError extends Error {
  readonly code: string;
  readonly kind: StudioClipsFailureKind;
  readonly publicMessage: string;

  constructor(input: {
    cause?: unknown;
    code: string;
    kind: StudioClipsFailureKind;
    publicMessage: string;
  }) {
    super(input.publicMessage, { cause: input.cause });
    this.name = "StudioClipsWorkerError";
    this.code = input.code;
    this.kind = input.kind;
    this.publicMessage = input.publicMessage;
  }
}
