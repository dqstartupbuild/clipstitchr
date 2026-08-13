import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioEditorProjectWriteRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioEditorProjectWrite", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioEditorProjectWriteGlobal", {
    throws: true,
  });
}
