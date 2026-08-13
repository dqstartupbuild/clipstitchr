export type StudioReelWorkerFailure = {
  readonly code: string;
  readonly kind: "permanent" | "retryable" | "uncertain";
  readonly message: string;
};
