import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";

export function readStudioReelWorkerInteger(input: {
  fallback: number;
  maximum: number;
  minimum: number;
  name: string;
  value: string | undefined;
}) {
  if (!input.value?.trim()) return input.fallback;
  const parsed = Number(input.value);
  if (
    !Number.isInteger(parsed) ||
    parsed < input.minimum ||
    parsed > input.maximum
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_WORKER_CONFIGURATION",
      kind: "permanent",
      publicMessage: `${input.name} is outside its supported range.`,
    });
  }
  return parsed;
}
