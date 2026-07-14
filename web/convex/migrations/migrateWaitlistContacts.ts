import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { createProviderContactKey } from "../../lib/clipstitchr/email/contact/createProviderContactKey";
import { getMarketingLeadSegmentForTool } from "../marketingContacts/getMarketingLeadSegmentForTool";
import { getWaitlistMigrationTimestamp } from "./getWaitlistMigrationTimestamp";

export const migrateWaitlistContacts = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);
    const page = await ctx.db
      .query("waitlist")
      .paginate({
        ...paginationOpts,
        numItems: Math.min(50, paginationOpts.numItems),
      });
    let createdContactCount = 0;
    let createdConsentCount = 0;

    for (const entry of page.page) {
      const alreadyMigrated = await ctx.db
        .query("marketingContacts")
        .withIndex("by_legacy_waitlist_id", (query) =>
          query.eq("legacyWaitlistId", entry._id),
        )
        .unique();
      let contact =
        alreadyMigrated ??
        (await ctx.db
          .query("marketingContacts")
          .withIndex("by_normalized_email", (query) =>
            query.eq("normalizedEmail", entry.normalizedEmail),
          )
          .unique());
      const capturedAt = getWaitlistMigrationTimestamp(entry);
      const source = entry.source === "sign-up-page" ? undefined : entry.source;

      if (!contact) {
        let providerContactKey = createProviderContactKey();

        while (
          await ctx.db
            .query("marketingContacts")
            .withIndex("by_provider_contact_key", (query) =>
              query.eq("providerContactKey", providerContactKey),
            )
            .unique()
        ) {
          providerContactKey = createProviderContactKey();
        }

        const contactId = await ctx.db.insert("marketingContacts", {
          normalizedEmail: entry.normalizedEmail,
          contactName: entry.name,
          providerContactKey,
          consentStatus: "consentUnknown",
          verificationStatus: "unverified",
          subscriptionStatus: "notSubscribed",
          suppressionStatus: "none",
          deletionStatus: "active",
          marketingEligible: false,
          ...(source ? { firstTool: source, latestTool: source } : {}),
          leadSegment: source
            ? getMarketingLeadSegmentForTool(source)
            : "unclassified",
          leadStage: "captured",
          legacyWaitlistId: entry._id,
          createdAt: capturedAt,
          updatedAt: capturedAt,
        });
        contact = await ctx.db.get(contactId);
        createdContactCount += 1;
      } else if (!contact.legacyWaitlistId) {
        await ctx.db.patch(contact._id, {
          legacyWaitlistId: entry._id,
          ...(!contact.firstTool && source ? { firstTool: source } : {}),
          createdAt: Math.min(contact.createdAt, capturedAt),
        });
      }

      if (!contact) throw new Error("Unable to migrate waitlist contact.");

      const existingConsent = await ctx.db
        .query("marketingConsents")
        .withIndex("by_legacy_waitlist_id", (query) =>
          query.eq("legacyWaitlistId", entry._id),
        )
        .unique();

      if (!existingConsent) {
        const consentId = await ctx.db.insert("marketingConsents", {
          contactId: contact._id,
          status: "consentUnknown",
          source: entry.source,
          capturedAt,
          legacyWaitlistId: entry._id,
          createdAt: capturedAt,
        });

        if (!contact.currentConsentId) {
          await ctx.db.patch(contact._id, { currentConsentId: consentId });
        }
        createdConsentCount += 1;
      }
    }

    return {
      continueCursor: page.continueCursor,
      createdConsentCount,
      createdContactCount,
      isDone: page.isDone,
      processedCount: page.page.length,
    };
  },
});
