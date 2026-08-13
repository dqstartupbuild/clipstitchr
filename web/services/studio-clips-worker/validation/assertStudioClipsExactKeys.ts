import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export function assertStudioClipsExactKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
  label: string,
): void {
  const allowed = new Set(allowedKeys);

  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new StudioClipsWorkerError({
      code: "INVALID_PIPELINE_ARTIFACT",
      kind: "permanent",
      publicMessage: `${label} contains unsupported fields.`,
    });
  }
}
