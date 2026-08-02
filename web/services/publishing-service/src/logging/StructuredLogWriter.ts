import type { StructuredLogRecord } from "./StructuredLogRecord.js";

export type StructuredLogWriter = (record: StructuredLogRecord) => void;
