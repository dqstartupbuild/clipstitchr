export function readTextWritingModelEnvValue(value?: string) {
  const trimmedValue = value?.trim();

  return trimmedValue && trimmedValue !== "PLACEHOLDER"
    ? trimmedValue
    : undefined;
}
