export function readHookLabSourceNumber(
  input: unknown,
  candidatePaths: readonly string[],
) {
  for (const candidatePath of candidatePaths) {
    let value: unknown = input;

    for (const segment of candidatePath.split(".")) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        value = undefined;
        break;
      }

      value = (value as Record<string, unknown>)[segment];
    }

    const parsedValue =
      typeof value === "number"
        ? value
        : typeof value === "string" && value.trim()
          ? Number(value.replaceAll(",", ""))
          : Number.NaN;

    if (Number.isFinite(parsedValue) && parsedValue >= 0) {
      return Math.floor(parsedValue);
    }
  }

  return undefined;
}
