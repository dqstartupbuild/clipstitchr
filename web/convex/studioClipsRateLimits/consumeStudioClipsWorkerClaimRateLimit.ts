import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioClipsWorkerClaimRateLimit(
  ctx: MutationCtx,
  workerId: string,
) {
  await rateLimiter.limit(ctx, "studioClipsWorkerClaim", {
    key: workerId,
    throws: true,
  });
}
