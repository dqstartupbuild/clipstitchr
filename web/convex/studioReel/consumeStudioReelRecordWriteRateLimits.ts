import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioReelRecordWriteRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioReelRecordWrite", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioReelRecordWriteGlobal", {
    throws: true,
  });
}
