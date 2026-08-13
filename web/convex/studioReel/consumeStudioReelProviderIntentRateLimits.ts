import type { MutationCtx } from "../_generated/server";
import type { Infer } from "convex/values";
import { rateLimiter } from "../rateLimiter";
import { studioReelProviderValidator } from "../validators/studioReelProvider";

type StudioReelProvider = Infer<typeof studioReelProviderValidator>;

export async function consumeStudioReelProviderIntentRateLimits(
  ctx: MutationCtx,
  ownerId: string,
  provider: StudioReelProvider,
  count: number,
) {
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    throw new Error("Provider intent count must be between 1 and 100.");
  }
  if (provider === "dansugc") {
    await rateLimiter.limit(ctx, "studioReelDanSugcIntent", {
      key: ownerId,
      count,
      throws: true,
    });
    await rateLimiter.limit(ctx, "studioReelDanSugcIntentGlobal", {
      count,
      throws: true,
    });
    return;
  }
  if (provider === "gemini") {
    await rateLimiter.limit(ctx, "studioReelGeminiIntent", {
      key: ownerId,
      count,
      throws: true,
    });
    await rateLimiter.limit(ctx, "studioReelGeminiIntentGlobal", {
      count,
      throws: true,
    });
    return;
  }
  if (provider === "elevenlabs") {
    await rateLimiter.limit(ctx, "studioReelElevenLabsIntent", {
      key: ownerId,
      count,
      throws: true,
    });
    await rateLimiter.limit(ctx, "studioReelElevenLabsIntentGlobal", {
      count,
      throws: true,
    });
    return;
  }
  await rateLimiter.limit(ctx, "studioReelRenderIntent", {
    key: ownerId,
    count,
    throws: true,
  });
  await rateLimiter.limit(ctx, "studioReelRenderIntentGlobal", {
    count,
    throws: true,
  });
}
