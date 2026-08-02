import type { StructuredLogFields } from "./StructuredLogFields.js";
import type { StructuredLogLevel } from "./StructuredLogLevel.js";

export type StructuredLogger = Readonly<{
  log: (
    level: StructuredLogLevel,
    message: string,
    fields?: StructuredLogFields,
  ) => void;
  debug: (message: string, fields?: StructuredLogFields) => void;
  info: (message: string, fields?: StructuredLogFields) => void;
  warn: (message: string, fields?: StructuredLogFields) => void;
  error: (message: string, fields?: StructuredLogFields) => void;
}>;
