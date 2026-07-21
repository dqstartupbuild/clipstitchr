function readValuesAtPath(value: unknown, path: string[]): unknown[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => readValuesAtPath(item, path));
  }

  if (!path.length) {
    return [value];
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const [head, ...tail] = path;

  return readValuesAtPath((value as Record<string, unknown>)[head], tail);
}

export function readHookLabSourceStringArray(
  value: unknown,
  paths: string[],
) {
  return Array.from(
    new Set(
      paths.flatMap((path) =>
        readValuesAtPath(value, path.split("."))
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ),
  ).slice(0, 20);
}
