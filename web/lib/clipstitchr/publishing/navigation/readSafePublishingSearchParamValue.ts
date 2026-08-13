export function readSafePublishingSearchParamValue(
  value: string | string[] | undefined,
) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = firstValue?.trim();

  if (
    !normalizedValue ||
    normalizedValue.length > 256 ||
    /[\u0000-\u001f\u007f]/.test(normalizedValue)
  ) {
    return null;
  }

  return normalizedValue;
}
