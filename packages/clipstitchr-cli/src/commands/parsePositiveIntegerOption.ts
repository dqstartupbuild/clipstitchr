export function parsePositiveIntegerOption(value: unknown) {
  const numberValue = typeof value === "string" ? Number(value) : value;

  return typeof numberValue === "number" &&
    Number.isFinite(numberValue) &&
    numberValue > 0
    ? Math.floor(numberValue)
    : undefined;
}
