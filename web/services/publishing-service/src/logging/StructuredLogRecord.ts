import type { StructuredLogFields } from "./StructuredLogFields.js";
import type { StructuredLogLevel } from "./StructuredLogLevel.js";

export type StructuredLogRecord = Readonly<{
  timestamp: string;
  service: "clipstitchr-publishing-service";
  level: StructuredLogLevel;
  message: string;
  fields: StructuredLogFields;
}>;
