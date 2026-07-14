import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function createMarketingConsentForCapture(
  ctx: MutationCtx,
  args: {
    capturedAt: number;
    consentCopyVersion: string;
    contactId: Id<"marketingContacts">;
    source: Doc<"toolLeadCaptures">["source"];
    wasMarketingEligible: boolean;
  },
) {
  const status = args.wasMarketingEligible
    ? ("confirmed" as const)
    : ("pendingVerification" as const);
  const consentId = await ctx.db.insert("marketingConsents", {
    contactId: args.contactId,
    status,
    copyVersion: args.consentCopyVersion,
    source: args.source,
    capturedAt: args.capturedAt,
    ...(status === "confirmed" ? { confirmedAt: args.capturedAt } : {}),
    createdAt: args.capturedAt,
  });

  await ctx.db.patch(args.contactId, { currentConsentId: consentId });

  return consentId;
}
