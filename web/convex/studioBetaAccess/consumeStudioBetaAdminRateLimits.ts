import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export async function consumeStudioBetaAdminRateLimits(
  ctx: MutationCtx,
  key: string,
) {
  await rateLimiter.limit(ctx, "studioBetaAdminAction", {
    key,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioBetaAdminActionGlobal", {
    throws: true,
  });
}
