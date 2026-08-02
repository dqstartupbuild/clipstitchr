import type { StructuredLogFields } from "./StructuredLogFields.js";
import { redactLogValue } from "./redactLogValue.js";

export const redactLogFields = (
  fields: StructuredLogFields,
): StructuredLogFields => {
  const redacted = redactLogValue(fields);
  return typeof redacted === "object" && redacted !== null && !Array.isArray(redacted)
    ? (redacted as StructuredLogFields)
    : Object.freeze({ value: redacted });
};
