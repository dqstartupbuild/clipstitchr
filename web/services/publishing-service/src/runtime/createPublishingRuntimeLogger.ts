import { createStructuredLogger } from "../logging/createStructuredLogger.js";
import type { StructuredLogger } from "../logging/StructuredLogger.js";
import { writeStructuredLogRecord } from "../logging/writeStructuredLogRecord.js";

export const createPublishingRuntimeLogger = (): StructuredLogger =>
  createStructuredLogger(writeStructuredLogRecord);
