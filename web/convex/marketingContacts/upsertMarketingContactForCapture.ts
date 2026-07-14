import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getMarketingContactIsMarketingEligible } from "./getMarketingContactIsMarketingEligible";
import { getMarketingLeadStageWithAdvance } from "./getMarketingLeadStageWithAdvance";

type UpsertMarketingContactForCaptureArgs = {
  capturedAt: number;
  contactName: string;
  leadSegment: Doc<"marketingContacts">["leadSegment"];
  leadStage: Doc<"marketingContacts">["leadStage"];
  normalizedEmail: string;
  providerContactKey: string;
  source: NonNullable<Doc<"marketingContacts">["latestTool"]>;
};

export async function upsertMarketingContactForCapture(
  ctx: MutationCtx,
  args: UpsertMarketingContactForCaptureArgs,
) {
  const existing = await ctx.db
    .query("marketingContacts")
    .withIndex("by_normalized_email", (query) =>
      query.eq("normalizedEmail", args.normalizedEmail),
    )
    .unique();
  const wasMarketingEligible = existing
    ? getMarketingContactIsMarketingEligible(existing)
    : false;

  if (existing) {
    await ctx.db.patch(existing._id, {
      contactName: args.contactName,
      consentStatus: wasMarketingEligible
        ? "confirmed"
        : "pendingVerification",
      verificationStatus: wasMarketingEligible ? "verified" : "pending",
      marketingEligible: wasMarketingEligible,
      ...(!existing.firstTool ? { firstTool: args.source } : {}),
      latestTool: args.source,
      leadSegment: args.leadSegment,
      leadStage: getMarketingLeadStageWithAdvance(
        existing.leadStage,
        args.leadStage,
      ),
      updatedAt: args.capturedAt,
    });

    return {
      contactId: existing._id,
      wasMarketingEligible,
    };
  }

  const providerKeyCollision = await ctx.db
    .query("marketingContacts")
    .withIndex("by_provider_contact_key", (query) =>
      query.eq("providerContactKey", args.providerContactKey),
    )
    .unique();

  if (providerKeyCollision) {
    throw new Error("Invalid contact key.");
  }

  const contactId = await ctx.db.insert("marketingContacts", {
    normalizedEmail: args.normalizedEmail,
    contactName: args.contactName,
    providerContactKey: args.providerContactKey,
    consentStatus: "pendingVerification",
    verificationStatus: "pending",
    subscriptionStatus: "notSubscribed",
    suppressionStatus: "none",
    deletionStatus: "active",
    marketingEligible: false,
    firstTool: args.source,
    latestTool: args.source,
    leadSegment: args.leadSegment,
    leadStage: args.leadStage,
    createdAt: args.capturedAt,
    updatedAt: args.capturedAt,
  });

  return {
    contactId: contactId as Id<"marketingContacts">,
    wasMarketingEligible: false,
  };
}
