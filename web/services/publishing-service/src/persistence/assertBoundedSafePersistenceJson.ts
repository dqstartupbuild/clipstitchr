import { Buffer } from "node:buffer";

import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import { assertSafePersistenceJson } from "./assertSafePersistenceJson.js";

export const assertBoundedSafePersistenceJson = (
  value: unknown,
  field: string,
  maximumBytes: number,
): void => {
  assertSafePersistenceJson(value, field);

  if (Buffer.byteLength(JSON.stringify(value), "utf8") > maximumBytes) {
    throw new PublishingPersistenceValidationError(field);
  }
};
