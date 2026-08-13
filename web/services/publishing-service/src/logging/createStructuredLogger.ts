import type { StructuredLogFields } from "./StructuredLogFields.js";
import type { StructuredLogger } from "./StructuredLogger.js";
import type { StructuredLogWriter } from "./StructuredLogWriter.js";
import { writeStructuredLog } from "./writeStructuredLog.js";

export const createStructuredLogger = (
  writer: StructuredLogWriter,
  now: () => Date = () => new Date(),
): StructuredLogger => {
  return Object.freeze({
    log: (level, message, fields) =>
      writeStructuredLog(writer, now, level, message, fields),
    debug: (message: string, fields?: StructuredLogFields) =>
      writeStructuredLog(writer, now, "debug", message, fields),
    info: (message: string, fields?: StructuredLogFields) =>
      writeStructuredLog(writer, now, "info", message, fields),
    warn: (message: string, fields?: StructuredLogFields) =>
      writeStructuredLog(writer, now, "warn", message, fields),
    error: (message: string, fields?: StructuredLogFields) =>
      writeStructuredLog(writer, now, "error", message, fields),
  });
};
