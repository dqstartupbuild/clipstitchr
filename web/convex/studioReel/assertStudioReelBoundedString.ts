export function assertStudioReelBoundedString(
  value: string,
  options: { readonly label: string; readonly maxLength: number },
) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.length > options.maxLength
  ) {
    throw new Error(
      `${options.label} must contain 1 through ${options.maxLength} characters.`,
    );
  }

  return value.trim();
}
