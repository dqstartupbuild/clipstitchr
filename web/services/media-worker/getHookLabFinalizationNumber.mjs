export function getHookLabFinalizationNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Missing ${label}.`);
  }

  return value;
}
