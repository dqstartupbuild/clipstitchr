import type { StructuredLogFields } from "./StructuredLogFields.js";
import type { StructuredLogLevel } from "./StructuredLogLevel.js";
import type { StructuredLogger } from "./StructuredLogger.js";
import type { StructuredLogWriter } from "./StructuredLogWriter.js";
import { redactLogFields } from "./redactLogFields.js";
import { redactLogString } from "./redactLogString.js";

export const createStructuredLogger = (
  writer: StructuredLogWriter,
  now: () => Date = () => new Date(),
): StructuredLogger => {
  const log = (
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

  return Object.freeze({
    log,
    debug: (message: string, fields?: StructuredLogFields) =>
      log("debug", message, fields),
    info: (message: string, fields?: StructuredLogFields) =>
      log("info", message, fields),
    warn: (message: string, fields?: StructuredLogFields) =>
      log("warn", message, fields),
    error: (message: string, fields?: StructuredLogFields) =>
      log("error", message, fields),
  });
};
