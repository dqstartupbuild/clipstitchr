import type { StructuredLogRecord } from "./StructuredLogRecord.js";

export const writeStructuredLogRecord = (record: StructuredLogRecord): void => {
  process.stdout.write(`${JSON.stringify(record)}\n`);
};
