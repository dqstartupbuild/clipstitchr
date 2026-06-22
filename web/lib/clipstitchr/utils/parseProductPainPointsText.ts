export function parseProductPainPointsText(value: string) {
  return Array.from(
    new Set(
      value
        .split("\n")
        .map((line) => line.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean),
    ),
  );
}
