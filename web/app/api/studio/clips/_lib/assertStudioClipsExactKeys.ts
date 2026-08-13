export function assertStudioClipsExactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    throw new Error("The Studio Clips request contains unsupported fields.");
  }
}
