import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,127}$/u;

export const readPublishingApiIdentifier = (
  value: unknown,
  code: string,
): string => {
  if (typeof value !== "string" || !IDENTIFIER_PATTERN.test(value)) {
    throw new PublishingServiceHttpError(400, code);
  }

  return value;
};
