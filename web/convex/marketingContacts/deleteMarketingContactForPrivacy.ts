import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { internalMutation } from "../_generated/server";
import { revokeBrowserRecognitionTokensForContact } from "../browserRecognition/revokeBrowserRecognitionTokensForContact";
import { cancelEmailProviderOperationsForContact } from "../email/cancelEmailProviderOperationsForContact";
import { enqueueInitialContactDeleteOperation } from "../email/enqueueInitialContactDeleteOperation";
import { resumeHeldContactDeleteOperationsForContact } from "../email/resumeHeldContactDeleteOperationsForContact";
import { rateLimiter } from "../rateLimiter";
import { deleteCourseAccessForContact } from "../courseAccess/deleteCourseAccessForContact";

export const deleteMarketingContactForPrivacy = internalMutation({
  args: {
    contactId: v.id("marketingContacts"),
    deletedAt: v.number(),
  },
  handler: async (ctx, { contactId, deletedAt }) => {
    await rateLimiter.limit(ctx, "marketingPrivacyDeletionOperator", {
      throws: true,
    });
    const contact = await ctx.db.get(contactId);

    if (!contact) {
      return { deleted: false as const, providerDeleteOperationId: null };
    }

    const consents = await ctx.db
      .query("marketingConsents")
      .withIndex("by_contact_captured", (query) =>
        query.eq("contactId", contactId),
      )
      .collect();
    const legacyWaitlistIds = new Set<Id<"waitlist">>();

    if (contact.legacyWaitlistId) {
      legacyWaitlistIds.add(contact.legacyWaitlistId);
    }

    for (const consent of consents) {
      if (consent.legacyWaitlistId) {
        legacyWaitlistIds.add(consent.legacyWaitlistId);
      }
      await ctx.db.patch(consent._id, {
        status: "withdrawn",
        withdrawnAt: deletedAt,
        legacyWaitlistId: undefined,
      });
    }

    for (const legacyWaitlistId of legacyWaitlistIds) {
      if (await ctx.db.get(legacyWaitlistId)) {
        await ctx.db.delete(legacyWaitlistId);
      }
    }

    await deleteCourseAccessForContact(ctx, contactId);
    await ctx.db.patch(contactId, {
      normalizedEmail: `deleted-${contactId}`,
      contactName: "Deleted contact",
      providerContactId: undefined,
      consentStatus: "withdrawn",
      verificationStatus: "unverified",
      subscriptionStatus: "unsubscribed",
      suppressionStatus: "none",
      deletionStatus: "privacyDeleted",
      marketingEligible: false,
      firstTool: undefined,
      latestTool: undefined,
      currentConsentId: undefined,
      legacyWaitlistId: undefined,
      subscriptionChangedAt: deletedAt,
      deletionChangedAt: deletedAt,
      updatedAt: deletedAt,
    });
    await revokeBrowserRecognitionTokensForContact(ctx, contactId);
    await cancelEmailProviderOperationsForContact(ctx, contactId, deletedAt, {
      providerDeletionFence: true,
    });
    const providerDeleteOperationId =
      await enqueueInitialContactDeleteOperation(ctx, {
        contactId,
        now: deletedAt,
      });
    await resumeHeldContactDeleteOperationsForContact(ctx, {
      contactId,
      now: deletedAt,
    });

    return {
      deleted: true as const,
      providerDeleteOperationId,
    };
  },
});
