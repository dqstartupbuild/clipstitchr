import type { StudioReelWorkerFailureKind } from "../contracts/StudioReelWorkerFailureKind";

export class StudioReelWorkerError extends Error {
  readonly code: string;
  readonly kind: StudioReelWorkerFailureKind;
  readonly publicMessage: string;

  constructor(input: {
    cause?: unknown;
    code: string;
    kind: StudioReelWorkerFailureKind;
    publicMessage: string;
  }) {
    super(input.publicMessage, { cause: input.cause });
    this.name = "StudioReelWorkerError";
    this.code = input.code;
    this.kind = input.kind;
    this.publicMessage = input.publicMessage;
  }
}
