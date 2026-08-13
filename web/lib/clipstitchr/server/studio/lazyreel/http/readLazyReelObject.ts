export function readLazyReelObject(value: unknown, name: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object.`);
  }

  return value as Record<string, unknown>;
}
