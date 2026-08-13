export function assertStudioBetaJsonExactKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
) {
  const allowed = new Set(allowedKeys);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new Error("Studio request contains an unsupported field.");
  }
}
