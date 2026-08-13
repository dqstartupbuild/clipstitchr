import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioClipsRenderRevisionCreateRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioClipsRenderRevisionCreate", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioClipsRenderRevisionCreateGlobal", {
    throws: true,
  });
}
