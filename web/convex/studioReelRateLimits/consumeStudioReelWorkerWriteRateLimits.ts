import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioReelWorkerWriteRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioReelWorkerWrite", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioReelWorkerWriteGlobal", {
    throws: true,
  });
}
