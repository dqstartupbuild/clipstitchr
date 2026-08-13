export function deepFreezeStudioStitchValue<T>(value: T): Readonly<T> {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) {
    deepFreezeStudioStitchValue(child);
  }
  return Object.freeze(value);
}
