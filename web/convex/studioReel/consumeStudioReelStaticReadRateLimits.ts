import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioReelStaticReadRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioReelStaticRead", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioReelStaticReadGlobal", {
    throws: true,
  });
}
