import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

export const readPublishingApiRecord = (
  value: unknown,
  code: string,
): Record<string, unknown> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new PublishingServiceHttpError(400, code);
  }

  return value as Record<string, unknown>;
};
