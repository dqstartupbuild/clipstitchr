import { assertStudioReelBoundedString } from "./assertStudioReelBoundedString";

export function normalizeStudioReelIdentifierList(
  values: readonly string[],
  options: {
    readonly label: string;
    readonly maximumCount: number;
  },
) {
  if (
    !Array.isArray(values) ||
    values.length < 1 ||
    values.length > options.maximumCount
  ) {
    throw new Error(
      `${options.label} must contain 1 through ${options.maximumCount} IDs.`,
    );
  }
  const normalized = values.map((value) =>
    assertStudioReelBoundedString(value, {
      label: `${options.label} item`,
      maxLength: 120,
    }),
  );
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${options.label} must contain unique IDs.`);
  }

  return normalized;
}
