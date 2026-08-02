import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

const SENSITIVE_KEY_PATTERN =
  /(?:authorization|password|secret|token|cookie|assertion|code.?verifier|signed.?url)/iu;
const FORBIDDEN_STRING_PATTERN =
  /^(?:blob:|data:)|[?&](?:x-amz-|token=|signature=|sig=)/iu;

export const assertSafePersistenceJson = (
  value: unknown,
  field: string,
): void => {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new PublishingPersistenceValidationError(field);
    }
    return;
  }

  if (typeof value === "string") {
    if (FORBIDDEN_STRING_PATTERN.test(value)) {
      throw new PublishingPersistenceValidationError(field);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      assertSafePersistenceJson(item, field);
    }
    return;
  }

  if (typeof value !== "object") {
    throw new PublishingPersistenceValidationError(field);
  }

  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      throw new PublishingPersistenceValidationError(field);
    }
    assertSafePersistenceJson(item, field);
  }
};
