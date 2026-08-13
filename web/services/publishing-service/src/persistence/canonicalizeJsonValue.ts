import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import type { CanonicalJsonValue } from "./CanonicalJsonValue.js";

export const canonicalizeJsonValue = (value: CanonicalJsonValue): string => {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new PublishingPersistenceValidationError("canonicalRequest");
    }
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeJsonValue(item)).join(",")}]`;
  }

  const entries = Object.entries(value).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  return `{${entries
    .map(
      ([key, item]) => `${JSON.stringify(key)}:${canonicalizeJsonValue(item)}`,
    )
    .join(",")}}`;
};
