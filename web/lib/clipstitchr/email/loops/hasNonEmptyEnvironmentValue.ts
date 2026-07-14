export function hasNonEmptyEnvironmentValue(value: string | undefined) {
  return Boolean(value?.trim());
}
