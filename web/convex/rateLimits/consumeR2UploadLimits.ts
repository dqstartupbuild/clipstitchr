import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

type ConsumeR2UploadLimitsOptions = {
  objectCount: number;
  ownerId: string;
  totalBytes: number;
};

export async function consumeR2UploadLimits(
  ctx: MutationCtx,
  { objectCount, ownerId, totalBytes }: ConsumeR2UploadLimitsOptions,
) {
  await rateLimiter.limit(ctx, "r2UploadUrl", {
    count: objectCount,
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "r2UploadUrlGlobal", {
    count: objectCount,
    throws: true,
  });
  await rateLimiter.limit(ctx, "r2UploadBytes", {
    count: totalBytes,
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "r2UploadBytesGlobal", {
    count: totalBytes,
    throws: true,
  });
  await rateLimiter.limit(ctx, "r2UploadBytesMonthly", {
    count: totalBytes,
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "r2UploadBytesMonthlyGlobal", {
    count: totalBytes,
    throws: true,
  });
}
