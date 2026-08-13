import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export function readStudioClipsBoundedEnvironmentInteger(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
  name: string,
): number {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new StudioClipsWorkerError({
      code: "INVALID_WORKER_CONFIGURATION",
      kind: "permanent",
      publicMessage: `${name} is outside its supported range.`,
    });
  }
  return parsed;
}
