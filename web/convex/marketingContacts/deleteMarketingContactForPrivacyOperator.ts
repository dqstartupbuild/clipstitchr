import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { assertPrivacyDeletionOperatorSecret } from "../auth/assertPrivacyDeletionOperatorSecret";
import { getLoopsPrivacyDeletionConfiguration } from "../../lib/clipstitchr/email/loops/getLoopsPrivacyDeletionConfiguration";

export const deleteMarketingContactForPrivacyOperator = action({
  args: {
    contactId: v.id("marketingContacts"),
    secret: v.string(),
  },
  handler: async (ctx, { contactId, secret }) => {
    assertPrivacyDeletionOperatorSecret(secret);
    const deletedAt = Date.now();

    const deletion = await ctx.runMutation(
      internal.marketingContacts.deleteMarketingContactForPrivacy
        .deleteMarketingContactForPrivacy,
      { contactId, deletedAt },
    );

    if (!deletion.deleted || !deletion.providerDeleteOperationId) {
      return {
        deleted: false as const,
        providerDeletion: "not-found" as const,
      };
    }

    const providerConfiguration = getLoopsPrivacyDeletionConfiguration(
      process.env,
    );

    if (!providerConfiguration) {
      return {
        deleted: true as const,
        providerDeletion: "not-configured" as const,
      };
    }

    return {
      deleted: true as const,
      providerDeletion: "queued" as const,
    };
  },
});
