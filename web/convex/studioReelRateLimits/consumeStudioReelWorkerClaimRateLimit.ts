import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioReelWorkerClaimRateLimit(
  ctx: MutationCtx,
  workerId: string,
) {
  await rateLimiter.limit(ctx, "studioReelWorkerClaim", {
    key: workerId,
    throws: true,
  });
}
