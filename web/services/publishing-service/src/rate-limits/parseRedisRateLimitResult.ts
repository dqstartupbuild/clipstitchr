import { PublishingRateLimitStorageError } from "../errors/PublishingRateLimitStorageError.js";
import { parseRedisNonnegativeInteger } from "./parseRedisNonnegativeInteger.js";

export type ParsedRedisRateLimitResult = readonly [
  allowed: 0 | 1,
  observedAtEpochMilliseconds: number,
  globalRemaining: number,
  globalResetAtEpochMilliseconds: number,
  tenantRemaining: number,
  tenantResetAtEpochMilliseconds: number,
];

export const parseRedisRateLimitResult = (
  value: unknown,
): ParsedRedisRateLimitResult => {
  if (!Array.isArray(value) || value.length !== 6) {
    throw new PublishingRateLimitStorageError();
  }

  const parsed = value.map(parseRedisNonnegativeInteger);
  const allowed = parsed[0];

  if (allowed !== 0 && allowed !== 1) {
    throw new PublishingRateLimitStorageError();
  }

  return [
    allowed,
    parsed[1] as number,
    parsed[2] as number,
    parsed[3] as number,
    parsed[4] as number,
    parsed[5] as number,
  ];
};
