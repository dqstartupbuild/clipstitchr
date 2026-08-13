import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

export const assertExactPublishingApiKeys = (
  record: Readonly<Record<string, unknown>>,
  required: readonly string[],
  optional: readonly string[],
  code: string,
): void => {
  const allowed = new Set([...required, ...optional]);
  if (
    required.some((key) => !Object.hasOwn(record, key)) ||
    Object.keys(record).some((key) => !allowed.has(key))
  ) {
    throw new PublishingServiceHttpError(400, code);
  }
};
