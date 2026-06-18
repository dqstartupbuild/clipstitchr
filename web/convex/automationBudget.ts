import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { automationToolValidator } from "./validators/automationTool";
import { getAutomationProductScopeKey } from "./getAutomationProductScopeKey";

export async function consumeAutomationBudget(
  ctx: MutationCtx,
  {
    ownerId,
    tool,
    count = 1,
    avatarId,
    providerCostUnits,
    productId,
  }: {
    avatarId?: string;
    count?: number;
    ownerId: string;
    providerCostUnits?: number;
    productId?: string;
    tool: "avatar-photo" | "clipr" | "stitchr" | "swapr" | "swipr";
  },
) {
  const normalizedCount = Math.max(1, Math.ceil(count));
  const dailyKey = `${ownerId}:${getAutomationProductScopeKey(productId)}`;

  if (tool === "stitchr") {
    await rateLimiter.limit(ctx, "automationStitchrDaily", {
      key: dailyKey,
      count: normalizedCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationStitchrGlobalDaily", {
      count: normalizedCount,
      throws: true,
    });
  }

  if (tool === "swapr") {
    await rateLimiter.limit(ctx, "automationSwaprDaily", {
      key: dailyKey,
      count: normalizedCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationSwaprGlobalDaily", {
      count: normalizedCount,
      throws: true,
    });
  }

  if (tool === "clipr") {
    await rateLimiter.limit(ctx, "automationCliprDaily", {
      key: dailyKey,
      count: normalizedCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationCliprGlobalDaily", {
      count: normalizedCount,
      throws: true,
    });
  }

  if (tool === "avatar-photo") {
    if (!avatarId) {
      throw new Error("Avatar photo automation requires an avatarId.");
    }

    await rateLimiter.limit(ctx, "automationAvatarPhotoDaily", {
      key: `${dailyKey}:${avatarId}`,
      count: normalizedCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationAvatarPhotoGlobalDaily", {
      count: normalizedCount,
      throws: true,
    });
  }

  if (tool === "swipr") {
    await rateLimiter.limit(ctx, "automationSwiprDaily", {
      key: dailyKey,
      count: normalizedCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationSwiprGlobalDaily", {
      count: normalizedCount,
      throws: true,
    });
  }

  if (providerCostUnits !== undefined) {
    await rateLimiter.limit(ctx, "automationProviderCostDailyGlobal", {
      count: Math.max(1, Math.ceil(providerCostUnits)),
      throws: true,
    });
  }
}

export const consume = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    productId: v.optional(v.string()),
    tool: automationToolValidator,
    count: v.optional(v.number()),
    avatarId: v.optional(v.string()),
    providerCostUnits: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { secret, ownerId, productId, tool, count = 1, avatarId, providerCostUnits },
  ) => {
    assertAutomationWorkerSecret(secret);

    await consumeAutomationBudget(ctx, {
      ownerId,
      productId,
      tool,
      count,
      avatarId,
      providerCostUnits,
    });
  },
});
