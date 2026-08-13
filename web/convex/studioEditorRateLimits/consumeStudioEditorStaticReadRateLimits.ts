import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioEditorStaticReadRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioEditorStaticRead", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioEditorStaticReadGlobal", {
    throws: true,
  });
}
