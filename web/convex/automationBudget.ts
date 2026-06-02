import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { automationToolValidator } from "./validators/automationTool";

export async function consumeAutomationBudget(
  ctx: MutationCtx,
  {
    ownerId,
    tool,
    count = 1,
    avatarId,
    providerCostUnits,
  }: {
    avatarId?: string;
    count?: number;
    ownerId: string;
    providerCostUnits?: number;
    tool: "avatar-photo" | "clipr" | "stitchr" | "swapr" | "swipr";
  },
) {
  const normalizedCount = Math.max(1, Math.ceil(count));

  if (tool === "stitchr") {
    await rateLimiter.limit(ctx, "automationStitchrDaily", {
      key: ownerId,
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
      key: ownerId,
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
      key: ownerId,
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
      key: `${ownerId}:${avatarId}`,
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
      key: ownerId,
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
    tool: automationToolValidator,
    count: v.optional(v.number()),
    avatarId: v.optional(v.string()),
    providerCostUnits: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { secret, ownerId, tool, count = 1, avatarId, providerCostUnits },
  ) => {
    assertAutomationWorkerSecret(secret);

    await consumeAutomationBudget(ctx, {
      ownerId,
      tool,
      count,
      avatarId,
      providerCostUnits,
    });
  },
});
