export const isPublishingApiTimeZone = (value: unknown): value is string => {
  if (typeof value !== "string" || value.length < 1 || value.length > 128) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
};
