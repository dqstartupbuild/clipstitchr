export function readOptionalStudioReelWorkerEnvironmentValue(
  value: string | undefined,
) {
  return value?.trim() || undefined;
}
