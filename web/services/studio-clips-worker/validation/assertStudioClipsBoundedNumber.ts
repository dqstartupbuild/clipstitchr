import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export function assertStudioClipsBoundedNumber(
  value: unknown,
  input: { integer?: boolean; label: string; maximum: number; minimum: number },
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < input.minimum ||
    value > input.maximum ||
    (input.integer === true && !Number.isInteger(value))
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_PIPELINE_ARTIFACT",
      kind: "permanent",
      publicMessage: `${input.label} is outside the supported limits.`,
    });
  }
}
