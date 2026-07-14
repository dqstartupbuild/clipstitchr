import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { enqueueEmailProviderOperation } from "../email/enqueueEmailProviderOperation";
import { getMarketingContactIsMarketingEligible } from "../marketingContacts/getMarketingContactIsMarketingEligible";
import { getMarketingLeadStageWithAdvance } from "../marketingContacts/getMarketingLeadStageWithAdvance";
import { rateLimiter } from "../rateLimiter";
import { publicToolGateModeValidator } from "../validators/publicToolGateMode";
import { publicToolGateVariantValidator } from "../validators/publicToolGateVariant";
import { toolLeadInteractionTypeValidator } from "../validators/toolLeadInteractionType";
import { toolLeadSourceValidator } from "../validators/toolLeadSource";
import { getMarketingLeadStageForInteraction } from "./getMarketingLeadStageForInteraction";
import { getToolLeadGateModeIsValid } from "./getToolLeadGateModeIsValid";

const digestPattern = /^[a-f0-9]{64}$/;

export const recordInteraction = mutation({
  args: {
    clientKey: v.string(),
    gateMode: publicToolGateModeValidator,
    gateVariant: publicToolGateVariantValidator,
    interactionType: toolLeadInteractionTypeValidator,
    occurredAt: v.number(),
    recognitionTokenHash: v.string(),
    secret: v.string(),
    source: toolLeadSourceValidator,
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    if (
      !digestPattern.test(args.clientKey) ||
      !digestPattern.test(args.recognitionTokenHash) ||
      !Number.isFinite(args.occurredAt) ||
      !getToolLeadGateModeIsValid(args.source, args.gateMode)
    ) {
      throw new Error("Invalid interaction.");
    }

    await rateLimiter.limit(ctx, "toolLeadInteractionByToken", {
      key: args.recognitionTokenHash,
      throws: true,
    });
    await rateLimiter.limit(ctx, "toolLeadInteractionByClient", {
      key: args.clientKey,
      throws: true,
    });
    await rateLimiter.limit(ctx, "toolLeadInteractionGlobal", {
      throws: true,
    });

    const token = await ctx.db
      .query("browserRecognitionTokens")
      .withIndex("by_token_hash", (query) =>
        query.eq("tokenHash", args.recognitionTokenHash),
      )
      .unique();

    if (
      !token ||
      token.revokedAt !== undefined ||
      token.expiresAt <= args.occurredAt
    ) {
      return { accepted: true as const };
    }

    const contact = await ctx.db.get(token.contactId);

    if (!contact || !getMarketingContactIsMarketingEligible(contact)) {
      return { accepted: true as const };
    }

    const leadStage = getMarketingLeadStageWithAdvance(
      contact.leadStage,
      getMarketingLeadStageForInteraction(args.interactionType),
    );

    await ctx.db.insert("toolLeadInteractions", {
      contactId: contact._id,
      recognitionTokenId: token._id,
      source: args.source,
      interactionType: args.interactionType,
      gateMode: args.gateMode,
      gateVariant: args.gateVariant,
      occurredAt: args.occurredAt,
    });
    await ctx.db.patch(contact._id, {
      latestTool: args.source,
      leadStage,
      updatedAt: args.occurredAt,
    });
    await enqueueEmailProviderOperation(ctx, {
      contactId: contact._id,
      kind: "contactSync",
      now: args.occurredAt,
    });

    return { accepted: true as const };
  },
});
