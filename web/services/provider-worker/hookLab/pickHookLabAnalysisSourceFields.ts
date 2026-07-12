export function pickHookLabAnalysisSourceFields(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
) {
  if (!source) {
    return {};
  }

  return Object.fromEntries(
    keys.flatMap((key) => {
      const value = source[key];

      return value === undefined || value === null || value === ""
        ? []
        : [[key, value]];
    }),
  );
}
