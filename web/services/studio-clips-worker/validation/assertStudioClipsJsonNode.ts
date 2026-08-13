export function assertStudioClipsJsonNode(
  current: unknown,
  depth: number,
  state: { nodes: number },
): void {
  state.nodes += 1;
  if (depth > 20 || state.nodes > 50_000) {
    throw new Error("JSON structure limit exceeded");
  }
  if (
    current === null ||
    typeof current === "string" ||
    typeof current === "boolean"
  ) {
    return;
  }
  if (typeof current === "number") {
    if (!Number.isFinite(current)) throw new Error("Non-finite JSON number");
    return;
  }
  if (Array.isArray(current)) {
    for (const item of current) {
      assertStudioClipsJsonNode(item, depth + 1, state);
    }
    return;
  }
  if (typeof current === "object") {
    const prototype = Object.getPrototypeOf(current);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error("Unsupported JSON prototype");
    }
    for (const [key, item] of Object.entries(current)) {
      if (key.length > 200 || key === "__proto__" || key === "constructor") {
        throw new Error("Unsupported JSON key");
      }
      assertStudioClipsJsonNode(item, depth + 1, state);
    }
    return;
  }
  throw new Error("Unsupported JSON value");
}
