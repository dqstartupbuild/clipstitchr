export function assertStudioReelWorkerExactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    throw new Error("The Studio Stitch worker request has unsupported fields.");
  }
}
