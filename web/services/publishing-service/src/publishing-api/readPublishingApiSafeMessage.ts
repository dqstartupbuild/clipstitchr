export const readPublishingApiSafeMessage = (
  value: string | null | undefined,
): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const safe = value.replace(/[\u0000-\u001f\u007f]/gu, " ").trim();
  return safe.length === 0 ? null : safe.slice(0, 4_096);
};
