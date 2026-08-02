import { PublishingRateLimitStorageError } from "../errors/PublishingRateLimitStorageError.js";

export const parseRedisNonnegativeInteger = (value: unknown): number => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new PublishingRateLimitStorageError();
  }

  return parsed;
};
