import { v } from "convex/values";
import { internal } from "../_generated/api";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getEmailNativeSourceForWorkflowKey } from "../toolLeads/getEmailNativeSourceForWorkflowKey";
import { getEmailConfirmationTokenIsAvailable } from "./getEmailConfirmationTokenIsAvailable";
import { getOrCreateMarketingWorkflowEnrollment } from "./getOrCreateMarketingWorkflowEnrollment";
import { enqueueEmailProviderOperation } from "./enqueueEmailProviderOperation";
import { rateLimiter } from "../rateLimiter";
import { validateEmailConfirmationReference } from "./validateEmailConfirmationReference";
import { activateCourseEntitlement } from "../courseAccess/activateCourseEntitlement";
import { createCourseAccessSession } from "../courseAccess/createCourseAccessSession";
import { getEmailNativeWorkflowKeyForSource } from "../toolLeads/getEmailNativeWorkflowKeyForSource";
import { courseAccessSessionTtlSeconds } from "../../lib/clipstitchr/tools/courses/session/courseAccessSessionTtlSeconds";

export const confirmEmailConsent = mutation({
  args: {
    clientKey: v.string(),
    confirmedAt: v.number(),
    courseSessionExpiresAt: v.optional(v.number()),
    courseSessionTokenHash: v.optional(v.string()),
    expiresAt: v.number(),
    secret: v.string(),
    tokenDigest: v.string(),
    tokenRecordId: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    if (
      !validateEmailConfirmationReference({
        clientKey: args.clientKey,
        expiresAt: args.expiresAt,
        inspectedAt: args.confirmedAt,
        tokenDigest: args.tokenDigest,
        tokenRecordId: args.tokenRecordId,
      })
    ) {
      return { status: "unavailable" as const };
    }

    await rateLimiter.limit(ctx, "emailConfirmationRedeemByToken", {
      key: args.tokenRecordId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "emailConfirmationRedeemByClient", {
      key: args.clientKey,
      throws: true,
    });
    await rateLimiter.limit(ctx, "emailConfirmationRedeemGlobal", {
      throws: true,
    });

    const token = await ctx.db
      .query("emailConfirmationTokens")
      .withIndex("by_token_record_id", (query) =>
        query.eq("tokenRecordId", args.tokenRecordId),
      )
      .unique();
    const contact = token ? await ctx.db.get(token.contactId) : null;

    if (
      !getEmailConfirmationTokenIsAvailable({
        contact,
        expiresAt: args.expiresAt,
        inspectedAt: args.confirmedAt,
        token,
        tokenDigest: args.tokenDigest,
      }) ||
      !token ||
      !contact ||
      !contact.currentConsentId
    ) {
      return { status: "unavailable" as const };
    }

    const consent = await ctx.db.get(contact.currentConsentId);

    if (!consent || consent.contactId !== contact._id) {
      return { status: "unavailable" as const };
    }

    const latestCapture = await ctx.db
      .query("toolLeadCaptures")
      .withIndex("by_contact_captured", (query) =>
        query.eq("contactId", contact._id),
      )
      .order("desc")
      .first();

    if (!latestCapture) return { status: "unavailable" as const };

    const courseKey = token.courseKey;
    const courseWorkflowKey = courseKey
      ? getEmailNativeWorkflowKeyForSource(courseKey)
      : null;

    if (
      courseKey &&
      (!courseWorkflowKey ||
        !args.courseSessionTokenHash ||
        args.courseSessionExpiresAt !==
          args.confirmedAt + courseAccessSessionTtlSeconds * 1_000)
    ) {
      return { status: "unavailable" as const };
    }

    const generalEnrollment = await getOrCreateMarketingWorkflowEnrollment(
      ctx,
      {
        contactId: contact._id,
        createdAt: args.confirmedAt,
        workflowKey: "tool_lead_captured",
        workflowVersion: "v1",
      },
    );

    if (courseKey && courseWorkflowKey) {
      await activateCourseEntitlement(ctx, {
        activatedAt: args.confirmedAt,
        contactId: contact._id,
        courseKey,
        courseVersion: "v1",
      });
      await getOrCreateMarketingWorkflowEnrollment(ctx, {
        contactId: contact._id,
        createdAt: args.confirmedAt,
        workflowKey: courseWorkflowKey,
        workflowVersion: "v1",
      });
    }

    const allowedWorkflowKeys = new Set([
      "tool_lead_captured",
      ...(courseWorkflowKey ? [courseWorkflowKey] : []),
    ]);
    const enrollments = await ctx.db
      .query("marketingWorkflowEnrollments")
      .withIndex("by_contact_status", (query) =>
        query.eq("contactId", contact._id).eq("status", "pending"),
      )
      .collect();
    const dispatchableEnrollments: Array<{
      enrollment: (typeof enrollments)[number];
      resumableOperationId?: NonNullable<
        (typeof enrollments)[number]["operationId"]
      >;
    }> = [];

    for (const enrollment of enrollments) {
      if (!allowedWorkflowKeys.has(enrollment.workflowKey)) continue;

      if (enrollment.operationId === undefined) {
        dispatchableEnrollments.push({ enrollment });
        continue;
      }

      const operation = await ctx.db.get(enrollment.operationId);

      if (
        operation?.status === "canceled" &&
        operation.acceptanceStatus === "notAttempted" &&
        operation.attemptLeaseOwner === undefined
      ) {
        dispatchableEnrollments.push({
          enrollment,
          resumableOperationId: operation._id,
        });
      }
    }

    for (let index = 0; index < dispatchableEnrollments.length; index += 1) {
      await rateLimiter.limit(ctx, "emailWorkflowEventByContact", {
        key: contact._id,
        throws: true,
      });
      await rateLimiter.limit(ctx, "emailWorkflowEventGlobal", {
        throws: true,
      });
    }

    const hadOptedOut = contact.subscriptionStatus === "unsubscribed";
    const hadProviderDeletion = contact.deletionStatus === "providerDeleted";

    await ctx.db.patch(token._id, { usedAt: args.confirmedAt });
    await ctx.db.patch(consent._id, {
      status: "confirmed",
      confirmedAt: args.confirmedAt,
      withdrawnAt: undefined,
    });
    await ctx.db.patch(contact._id, {
      consentStatus: "confirmed",
      verificationStatus: "verified",
      subscriptionStatus: "subscribed",
      deletionStatus: "active",
      marketingEligible: true,
      subscriptionChangedAt: args.confirmedAt,
      deletionChangedAt: hadProviderDeletion
        ? args.confirmedAt
        : contact.deletionChangedAt,
      updatedAt: args.confirmedAt,
    });

    const tombstones = await ctx.db
      .query("providerDeletionTombstones")
      .withIndex("by_contact", (query) => query.eq("contactId", contact._id))
      .collect();

    for (const tombstone of tombstones) {
      if (tombstone.clearedAt === undefined) {
        await ctx.db.patch(tombstone._id, {
          clearedAt: args.confirmedAt,
          updatedAt: args.confirmedAt,
        });
      }
    }

    if (
      courseKey &&
      args.courseSessionTokenHash &&
      args.courseSessionExpiresAt !== undefined
    ) {
      await createCourseAccessSession(ctx, {
        contactId: contact._id,
        expiresAt: args.courseSessionExpiresAt,
        issuedAt: args.confirmedAt,
        tokenHash: args.courseSessionTokenHash,
      });
    }

    const contactSyncOperationId = await enqueueEmailProviderOperation(ctx, {
      contactId: contact._id,
      kind:
        hadOptedOut || hadProviderDeletion
          ? "contactResubscribe"
          : "contactSync",
      now: args.confirmedAt,
    });

    for (const {
      enrollment,
      resumableOperationId,
    } of dispatchableEnrollments) {
      const emailNativeSource = getEmailNativeSourceForWorkflowKey(
        enrollment.workflowKey,
      );
      const source = emailNativeSource ?? latestCapture.source;
      let operationId = resumableOperationId;

      if (operationId) {
        await ctx.db.patch(operationId, {
          status: "pending",
          acceptanceStatus: "notAttempted",
          dependsOnOperationId: contactSyncOperationId,
          failureCategory: undefined,
          leaseOwner: undefined,
          leaseExpiresAt: undefined,
          nextAttemptAt: args.confirmedAt,
          terminalAt: undefined,
          updatedAt: args.confirmedAt,
        });
        await ctx.scheduler.runAfter(
          0,
          internal.email.processEmailProviderOperation
            .processEmailProviderOperation,
          { operationId },
        );
      } else {
        operationId = await enqueueEmailProviderOperation(ctx, {
          contactId: contact._id,
          dependsOnOperationId: contactSyncOperationId,
          enrollmentId: enrollment._id,
          gateMode: emailNativeSource
            ? "email-native"
            : latestCapture.gateMode,
          kind: "workflowEvent",
          leadSegment: contact.leadSegment,
          now: args.confirmedAt,
          toolSource: source,
          workflowKey: enrollment.workflowKey,
          workflowVersion: enrollment.workflowVersion,
        });
      }

      await ctx.db.patch(enrollment._id, { operationId });
    }

    void generalEnrollment;
    return {
      status: "confirmed" as const,
      ...(courseKey ? { courseKey } : {}),
    };
  },
});
