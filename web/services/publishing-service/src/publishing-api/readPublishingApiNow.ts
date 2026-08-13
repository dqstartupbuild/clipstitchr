export const readPublishingApiNow = (now: () => Date): Date => {
  const value = now();
  if (!Number.isSafeInteger(value.getTime())) {
    throw new TypeError("The publishing API clock returned an invalid date.");
  }
  return value;
};
