import { redactStudioClipsSensitiveText } from "./redactStudioClipsSensitiveText";

const sensitiveKeyPattern =
  /(?:api[_-]?key|authorization|cookie|credential|password|secret|signature|signed[_-]?url|token)/i;

export function redactStudioClipsSensitiveNode(
  current: unknown,
  depth: number,
  seen: WeakSet<object>,
): unknown {
  if (depth > 8) return "[REDACTED_DEPTH]";
  if (typeof current === "string") {
    return redactStudioClipsSensitiveText(current);
  }
  if (
    current === null ||
    typeof current === "boolean" ||
    typeof current === "number"
  ) {
    return current;
  }
  if (Array.isArray(current)) {
    const result: unknown[] = [];
    for (const item of current) {
      result.push(redactStudioClipsSensitiveNode(item, depth + 1, seen));
    }
    return result;
  }
  if (typeof current !== "object") return String(current);
  if (seen.has(current)) return "[REDACTED_CIRCULAR]";
  seen.add(current);
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(current)) {
    result[key] = sensitiveKeyPattern.test(key)
      ? "[REDACTED]"
      : redactStudioClipsSensitiveNode(item, depth + 1, seen);
  }
  return result;
}
