import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioClipsTaskCreateRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioClipsTaskCreate", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioClipsTaskCreateGlobal", { throws: true });
}
