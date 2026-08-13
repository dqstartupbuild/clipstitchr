import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioClipsCostStageRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioClipsCostStage", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioClipsCostStageGlobal", { throws: true });
}
