import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioLazyReelRunWriteRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioLazyReelRunWrite", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioLazyReelRunWriteGlobal", {
    throws: true,
  });
}
