import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioLazyReelRecordWriteRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioLazyReelRecordWrite", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioLazyReelRecordWriteGlobal", {
    throws: true,
  });
}
