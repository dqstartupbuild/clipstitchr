import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { enqueueEmailProviderOperation } from "../email/enqueueEmailProviderOperation";
import { getOrCreateMarketingWorkflowEnrollment } from "../email/getOrCreateMarketingWorkflowEnrollment";
import { getMarketingContactIsMarketingEligible } from "../marketingContacts/getMarketingContactIsMarketingEligible";
import { rateLimiter } from "../rateLimiter";
import { marketingWorkflowKeyValidator } from "../validators/marketingWorkflowKey";
import { marketingWorkflowVersionValidator } from "../validators/marketingWorkflowVersion";
import { publicToolGateVariantValidator } from "../validators/publicToolGateVariant";
import { toolLeadSourceValidator } from "../validators/toolLeadSource";
import { getEmailNativeWorkflowKeyForSource } from "./getEmailNativeWorkflowKeyForSource";

const digestPattern = /^[a-f0-9]{64}$/;

export const enrollEmailNative = mutation({
  args: {
    clientKey: v.string(),
    enrolledAt: v.number(),
    gateVariant: publicToolGateVariantValidator,
    recognitionTokenHash: v.string(),
    secret: v.string(),
    source: toolLeadSourceValidator,
    workflowKey: marketingWorkflowKeyValidator,
    workflowVersion: marketingWorkflowVersionValidator,
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);
    const expectedWorkflowKey = getEmailNativeWorkflowKeyForSource(args.source);

    if (
      !digestPattern.test(args.clientKey) ||
      !digestPattern.test(args.recognitionTokenHash) ||
      !Number.isFinite(args.enrolledAt) ||
      !expectedWorkflowKey ||
      expectedWorkflowKey !== args.workflowKey ||
      args.workflowVersion !== "v1"
    ) {
      throw new Error("Invalid email enrollment.");
    }

    await rateLimiter.limit(ctx, "emailNativeEnrollmentByClient", {
      key: args.clientKey,
      throws: true,
    });
    await rateLimiter.limit(ctx, "emailNativeEnrollmentGlobal", {
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
      token.expiresAt <= args.enrolledAt
    ) {
      return { accepted: true as const };
    }

    const contact = await ctx.db.get(token.contactId);

    if (
      !contact ||
      contact.deletionStatus === "privacyDeleted" ||
      contact.suppressionStatus !== "none"
    ) {
      return { accepted: true as const };
    }

    const existingEnrollment = await ctx.db
      .query("marketingWorkflowEnrollments")
      .withIndex("by_contact_workflow_version", (query) =>
        query
          .eq("contactId", contact._id)
          .eq("workflowKey", args.workflowKey)
          .eq("workflowVersion", args.workflowVersion),
      )
      .unique();

    if (existingEnrollment) return { accepted: true as const };

    const contactLimit = await rateLimiter.limit(
      ctx,
      "emailNativeEnrollmentByContact",
      {
        key: contact._id,
        throws: false,
      },
    );

    if (!contactLimit.ok) return { accepted: true as const };

    const marketingEligible = getMarketingContactIsMarketingEligible(contact);

    if (marketingEligible) {
      const workflowContactLimit = await rateLimiter.limit(
        ctx,
        "emailWorkflowEventByContact",
        { key: contact._id, throws: false },
      );
      const workflowGlobalLimit = await rateLimiter.limit(
        ctx,
        "emailWorkflowEventGlobal",
        { throws: false },
      );

      if (!workflowContactLimit.ok || !workflowGlobalLimit.ok) {
        return { accepted: true as const };
      }
    }

    const enrollment = await getOrCreateMarketingWorkflowEnrollment(ctx, {
      contactId: contact._id,
      createdAt: args.enrolledAt,
      workflowKey: args.workflowKey,
      workflowVersion: args.workflowVersion,
    });

    if (!enrollment.created || !marketingEligible) {
      return { accepted: true as const };
    }

    const contactSyncOperationId = await enqueueEmailProviderOperation(ctx, {
      contactId: contact._id,
      kind: "contactSync",
      now: args.enrolledAt,
    });
    const operationId = await enqueueEmailProviderOperation(ctx, {
      contactId: contact._id,
      dependsOnOperationId: contactSyncOperationId,
      enrollmentId: enrollment.enrollmentId,
      gateMode: "email-native",
      kind: "workflowEvent",
      leadSegment: contact.leadSegment,
      now: args.enrolledAt,
      toolSource: args.source,
      workflowKey: args.workflowKey,
      workflowVersion: args.workflowVersion,
    });

    await ctx.db.patch(enrollment.enrollmentId, { operationId });

    return { accepted: true as const };
  },
});
