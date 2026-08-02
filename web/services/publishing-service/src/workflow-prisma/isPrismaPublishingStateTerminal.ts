export const isPrismaPublishingStateTerminal = (input: {
  disposition: string;
  internalState: string;
  attemptStatus: string;
}): boolean =>
  input.disposition !== "ACTIVE" ||
  input.internalState === "PUBLISHED" ||
  input.internalState === "FAILED" ||
  input.internalState === "CANCELED" ||
  input.internalState === "ACTION_REQUIRED" ||
  input.internalState === "UNCERTAIN" ||
  input.attemptStatus === "SUCCEEDED" ||
  input.attemptStatus === "FAILED" ||
  input.attemptStatus === "UNCERTAIN" ||
  input.attemptStatus === "CANCELED";
