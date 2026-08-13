import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioLazyReelRunCreateRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioLazyReelRunCreate", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioLazyReelRunCreateGlobal", {
    throws: true,
  });
}
