export const parseRetryAfterSeconds = (
  value: string | undefined,
): number | undefined => {
  if (value === undefined || !/^\d+$/.test(value)) {
    return undefined;
  }

  const seconds = Number(value);
  return Number.isSafeInteger(seconds) && seconds >= 0 ? seconds : undefined;
};
