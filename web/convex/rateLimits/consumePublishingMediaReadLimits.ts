import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

type ConsumePublishingMediaReadLimitsOptions = {
  grantKey: string;
  quotaIdentity: string;
  readBytes: number;
};

export async function consumePublishingMediaReadLimits(
  ctx: MutationCtx,
  {
    grantKey,
    quotaIdentity,
    readBytes,
  }: ConsumePublishingMediaReadLimitsOptions,
) {
  if (
    !/^pmg_[A-Za-z0-9_-]{22}$/.test(grantKey) ||
    !/^pmq_[A-Za-z0-9_-]{43}$/.test(quotaIdentity) ||
    !Number.isSafeInteger(readBytes) ||
    readBytes < 0 ||
    readBytes > 1024 * 1024 * 1024
  ) {
    throw new Error("Publishing media rate-limit request is invalid.");
  }

  const grantQuotaKey = `${quotaIdentity}:${grantKey}`;

  await rateLimiter.limit(ctx, "publishingMediaReadRequestsByGrant", {
    key: grantQuotaKey,
    throws: true,
  });
  await rateLimiter.limit(ctx, "publishingMediaReadRequestsByQuota", {
    key: quotaIdentity,
    throws: true,
  });
  await rateLimiter.limit(ctx, "publishingMediaReadRequestsGlobal", {
    throws: true,
  });

  if (readBytes > 0) {
    await rateLimiter.limit(ctx, "publishingMediaReadBytesByGrant", {
      count: readBytes,
      key: grantQuotaKey,
      throws: true,
    });
    await rateLimiter.limit(ctx, "publishingMediaReadBytesByQuota", {
      count: readBytes,
      key: quotaIdentity,
      throws: true,
    });
    await rateLimiter.limit(ctx, "publishingMediaReadBytesGlobal", {
      count: readBytes,
      throws: true,
    });
  }
}
