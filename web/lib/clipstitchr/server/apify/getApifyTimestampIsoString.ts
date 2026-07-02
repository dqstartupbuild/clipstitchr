function getApifyTimestampMs(value: number) {
  return value > 9999999999 ? value : value * 1000;
}

export function getApifyTimestampIsoString(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    const parsedDate = Date.parse(trimmed);

    if (Number.isFinite(parsedDate)) {
      return new Date(parsedDate).toISOString();
    }

    const parsedNumber = Number(trimmed);

    if (Number.isFinite(parsedNumber)) {
      return new Date(getApifyTimestampMs(parsedNumber)).toISOString();
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(getApifyTimestampMs(value)).toISOString();
  }

  return undefined;
}
