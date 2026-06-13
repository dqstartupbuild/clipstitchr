export function readStitchrTextGenerationString(
  value: unknown,
  maxLength: number,
) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
