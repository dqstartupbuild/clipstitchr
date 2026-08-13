import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioClipsRecordWriteRateLimits(
  ctx: MutationCtx,
  ownerId: string,
) {
  await rateLimiter.limit(ctx, "studioClipsRecordWrite", {
    key: ownerId,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioClipsRecordWriteGlobal", { throws: true });
}
