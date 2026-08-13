import type { StructuredLogFields } from "./StructuredLogFields.js";
import type { StructuredLogLevel } from "./StructuredLogLevel.js";
import type { StructuredLogWriter } from "./StructuredLogWriter.js";
import { redactLogFields } from "./redactLogFields.js";
import { redactLogString } from "./redactLogString.js";

export const writeStructuredLog = (
  writer: StructuredLogWriter,
  now: () => Date,
  level: StructuredLogLevel,
  message: string,
  fields: StructuredLogFields = {},
): void => {
  writer(
    Object.freeze({
      timestamp: now().toISOString(),
      service: "clipstitchr-publishing-service",
      level,
      message: redactLogString(message),
      fields: redactLogFields(fields),
    }),
  );
};
