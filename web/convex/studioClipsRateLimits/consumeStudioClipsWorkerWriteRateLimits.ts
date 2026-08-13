import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioClipsWorkerWriteRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioClipsWorkerWrite", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioClipsWorkerWriteGlobal", { throws: true });
}
