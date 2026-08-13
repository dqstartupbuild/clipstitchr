export function isStudioReelWorkerRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(value) && !Array.isArray(value) && typeof value === "object";
}
