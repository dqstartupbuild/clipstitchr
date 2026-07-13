export function normalizeAppHookTestingMatrixValues(
  values: readonly string[],
  maximum: number,
  fallback: string,
) {
  const unique = Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
  return (unique.length > 0 ? unique : [fallback]).slice(0, maximum);
}
