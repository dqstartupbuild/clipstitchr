export function readHookLabSourceString(
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

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    if (Array.isArray(value)) {
      const firstString = value.find(
        (item): item is string => typeof item === "string" && Boolean(item.trim()),
      );

      if (firstString) {
        return firstString.trim();
      }
    }
  }

  return undefined;
}
