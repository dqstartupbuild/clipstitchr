import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioClipsStaticReadRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioClipsStaticRead", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioClipsStaticReadGlobal", { throws: true });
}
