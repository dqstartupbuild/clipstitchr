export function readInferredProductPainPoints(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean),
    ),
  );
}
