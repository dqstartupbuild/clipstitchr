import { isSensitiveLogField } from "./isSensitiveLogField.js";
import { redactLogString } from "./redactLogString.js";

const REDACTED = "[REDACTED]";
const MAX_LOG_DEPTH = 8;

export const redactLogValue = (
  value: unknown,
  seen = new WeakSet<object>(),
  depth = 0,
): unknown => {
  if (depth > MAX_LOG_DEPTH) {
    return "[MAX_DEPTH]";
  }

  if (typeof value === "string") {
    return redactLogString(value);
  }

  if (
    value === null ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value === undefined) {
    return "[UNDEFINED]";
  }

  if (typeof value === "function" || typeof value === "symbol") {
    return "[UNSERIALIZABLE]";
  }

  if (value instanceof Error) {
    return Object.freeze({ name: value.name, message: REDACTED });
  }

  if (value instanceof Date) {
    return Number.isNaN(value.valueOf()) ? "[INVALID_DATE]" : value.toISOString();
  }

  if (value instanceof URL) {
    return redactLogString(value.toString());
  }

  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    return "[REDACTED_BINARY]";
  }

  if (typeof value !== "object") {
    return "[UNSERIALIZABLE]";
  }

  if (seen.has(value)) {
    return "[CIRCULAR]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return Object.freeze(
      value.map((item) => redactLogValue(item, seen, depth + 1)),
    );
  }

  const redactedEntries = Object.entries(value).map(([key, item]) => [
    key,
    isSensitiveLogField(key)
      ? REDACTED
      : redactLogValue(item, seen, depth + 1),
  ]);

  return Object.freeze(Object.fromEntries(redactedEntries));
};
