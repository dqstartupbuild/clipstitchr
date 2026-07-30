export function getFutureIsoDateTime(value: string) {
  const date = new Date(value);

  if (
    !value ||
    !Number.isFinite(date.getTime()) ||
    date.getTime() <= Date.now()
  ) {
    throw new Error("Choose a future date and time.");
  }

  return date.toISOString();
}
