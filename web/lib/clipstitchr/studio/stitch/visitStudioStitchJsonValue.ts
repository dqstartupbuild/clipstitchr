export function visitStudioStitchJsonValue(
  activeObjects: Set<object>,
  candidate: unknown,
): boolean {
  if (
    candidate === null ||
    typeof candidate === "string" ||
    typeof candidate === "boolean"
  ) {
    return true;
  }
  if (typeof candidate === "number") return Number.isFinite(candidate);
  if (typeof candidate !== "object" || activeObjects.has(candidate)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(candidate);
  if (
    !Array.isArray(candidate) &&
    prototype !== Object.prototype &&
    prototype !== null
  ) {
    return false;
  }
  const ownKeys = Reflect.ownKeys(candidate);
  if (Array.isArray(candidate)) {
    if (
      ownKeys.some(
        (key) =>
          typeof key === "symbol" ||
          (key !== "length" &&
            !Object.prototype.propertyIsEnumerable.call(candidate, key)),
      ) ||
      Object.keys(candidate).length !== candidate.length
    ) {
      return false;
    }
  } else if (
    ownKeys.some(
      (key) =>
        typeof key === "symbol" ||
        !Object.prototype.propertyIsEnumerable.call(candidate, key),
    )
  ) {
    return false;
  }
  activeObjects.add(candidate);
  const children = Array.isArray(candidate)
    ? candidate
    : Object.values(candidate as Record<string, unknown>);
  const safe = children.every(visitStudioStitchJsonValue.bind(null, activeObjects));
  activeObjects.delete(candidate);
  return safe;
}
