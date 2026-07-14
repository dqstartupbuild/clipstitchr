import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { rotateBrowserRecognitionToken } from "../browserRecognition/rotateBrowserRecognitionToken";
import { createEmailConfirmationToken } from "../email/createEmailConfirmationToken";
import { enqueueEmailProviderOperation } from "../email/enqueueEmailProviderOperation";
import { getOrCreateMarketingWorkflowEnrollment } from "../email/getOrCreateMarketingWorkflowEnrollment";
import { createMarketingConsentForCapture } from "../marketingContacts/createMarketingConsentForCapture";
import { getMarketingLeadSegmentForTool } from "../marketingContacts/getMarketingLeadSegmentForTool";
import { upsertMarketingContactForCapture } from "../marketingContacts/upsertMarketingContactForCapture";
import { rateLimiter } from "../rateLimiter";
import { publicToolGateModeValidator } from "../validators/publicToolGateMode";
import { publicToolGateVariantValidator } from "../validators/publicToolGateVariant";
import { toolLeadSourceValidator } from "../validators/toolLeadSource";
import { getToolLeadInputIsValid } from "../../lib/clipstitchr/tools/toolLeads/getToolLeadInputIsValid";
import { normalizeToolLeadEmail } from "../../lib/clipstitchr/tools/toolLeads/normalizeToolLeadEmail";
import { normalizeToolLeadName } from "../../lib/clipstitchr/tools/toolLeads/normalizeToolLeadName";
import { validateToolLeadCaptureEnvelope } from "./validateToolLeadCaptureEnvelope";
import { getToolLeadGateModeIsValid } from "./getToolLeadGateModeIsValid";
import { getEmailNativeWorkflowKeyForSource } from "./getEmailNativeWorkflowKeyForSource";

export const submit = mutation({
  args: {
    capturedAt: v.number(),
    clientKey: v.string(),
    confirmationExpiresAt: v.number(),
    consentCopyVersion: v.string(),
    email: v.string(),
    gateMode: publicToolGateModeValidator,
    gateVariant: publicToolGateVariantValidator,
    name: v.string(),
    previousRecognitionTokenHash: v.optional(v.string()),
    providerContactKey: v.string(),
    recognitionExpiresAt: v.number(),
    recognitionTokenHash: v.string(),
    secret: v.string(),
    source: toolLeadSourceValidator,
    tokenDigest: v.string(),
    tokenRecordId: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);
    validateToolLeadCaptureEnvelope(args);

    if (!getToolLeadGateModeIsValid(args.source, args.gateMode)) {
      throw new Error("Invalid gate metadata.");
    }

    const normalizedInput = {
      email: normalizeToolLeadEmail(args.email),
      name: normalizeToolLeadName(args.name),
    };

    if (!getToolLeadInputIsValid(normalizedInput)) {
      throw new Error("Invalid lead details.");
    }

    await rateLimiter.limit(ctx, "toolLeadSubmitByClient", {
      key: args.clientKey,
      throws: true,
    });
    await rateLimiter.limit(ctx, "toolLeadSubmitByEmail", {
      key: normalizedInput.email,
      throws: true,
    });
    await rateLimiter.limit(ctx, "toolLeadSubmitGlobal", { throws: true });

    const leadSegment = getMarketingLeadSegmentForTool(args.source);
    const contact = await upsertMarketingContactForCapture(ctx, {
      capturedAt: args.capturedAt,
      contactName: normalizedInput.name,
      leadSegment,
      leadStage: "captured",
      normalizedEmail: normalizedInput.email,
      providerContactKey: args.providerContactKey,
      source: args.source,
    });
    const emailNativeWorkflowKey =
      args.gateMode === "email-native"
        ? getEmailNativeWorkflowKeyForSource(args.source)
        : null;

    if (args.gateMode === "email-native" && !emailNativeWorkflowKey) {
      throw new Error("Invalid email enrollment.");
    }

    let emailNativeEnrollment:
      | Awaited<ReturnType<typeof getOrCreateMarketingWorkflowEnrollment>>
      | null = null;

    if (emailNativeWorkflowKey) {
      await rateLimiter.limit(ctx, "emailNativeEnrollmentByClient", {
        key: args.clientKey,
        throws: true,
      });
      await rateLimiter.limit(ctx, "emailNativeEnrollmentByContact", {
        key: contact.contactId,
        throws: true,
      });
      await rateLimiter.limit(ctx, "emailNativeEnrollmentGlobal", {
        throws: true,
      });
      emailNativeEnrollment = await getOrCreateMarketingWorkflowEnrollment(
        ctx,
        {
          contactId: contact.contactId,
          createdAt: args.capturedAt,
          workflowKey: emailNativeWorkflowKey,
          workflowVersion: "v1",
        },
      );
    }

    let confirmationDispatchAllowed = true;

    if (!contact.wasMarketingEligible) {
      const emailLimit = await rateLimiter.limit(
        ctx,
        "emailConfirmationSendByEmail",
        {
          key: normalizedInput.email,
          throws: false,
        },
      );
      const clientLimit = await rateLimiter.limit(
        ctx,
        "emailConfirmationSendByClient",
        {
          key: args.clientKey,
          throws: false,
        },
      );
      const confirmationGlobalLimit = await rateLimiter.limit(
        ctx,
        "emailConfirmationSendGlobal",
        { throws: false },
      );
      const contactTransactionalLimit = await rateLimiter.limit(
        ctx,
        "emailTransactionalByContact",
        {
          key: contact.contactId,
          throws: false,
        },
      );
      const transactionalGlobalLimit = await rateLimiter.limit(
        ctx,
        "emailTransactionalGlobal",
        { throws: false },
      );

      confirmationDispatchAllowed =
        emailLimit.ok &&
        clientLimit.ok &&
        confirmationGlobalLimit.ok &&
        contactTransactionalLimit.ok &&
        transactionalGlobalLimit.ok;
    }

    const consentId = await createMarketingConsentForCapture(ctx, {
      capturedAt: args.capturedAt,
      consentCopyVersion: args.consentCopyVersion,
      contactId: contact.contactId,
      source: args.source,
      wasMarketingEligible: contact.wasMarketingEligible,
    });

    await ctx.db.insert("toolLeadCaptures", {
      contactId: contact.contactId,
      consentId,
      source: args.source,
      gateMode: args.gateMode,
      gateVariant: args.gateVariant,
      capturedAt: args.capturedAt,
    });
    await rotateBrowserRecognitionToken(ctx, {
      contactId: contact.contactId,
      expiresAt: args.recognitionExpiresAt,
      issuedAt: args.capturedAt,
      previousTokenHash: args.previousRecognitionTokenHash,
      tokenHash: args.recognitionTokenHash,
    });

    if (!contact.wasMarketingEligible && !confirmationDispatchAllowed) {
      return { accepted: true as const };
    }

    if (!contact.wasMarketingEligible) {
      const confirmationTokenId = await createEmailConfirmationToken(ctx, {
        contactId: contact.contactId,
        createdAt: args.capturedAt,
        expiresAt: args.confirmationExpiresAt,
        tokenDigest: args.tokenDigest,
        tokenRecordId: args.tokenRecordId,
      });

      await enqueueEmailProviderOperation(ctx, {
        contactId: contact.contactId,
        confirmationTokenId,
        kind: "transactional",
        now: args.capturedAt,
        transactionalTemplateKey: "email-confirmation",
      });

      return { accepted: true as const };
    }

    const enrollment = await getOrCreateMarketingWorkflowEnrollment(ctx, {
      contactId: contact.contactId,
      createdAt: args.capturedAt,
      workflowKey: "tool_lead_captured",
      workflowVersion: "v1",
    });

    if (enrollment.created) {
      await rateLimiter.limit(ctx, "emailWorkflowEventByContact", {
        key: contact.contactId,
        throws: true,
      });
      await rateLimiter.limit(ctx, "emailWorkflowEventGlobal", {
        throws: true,
      });
    }

    if (emailNativeEnrollment?.created) {
      await rateLimiter.limit(ctx, "emailWorkflowEventByContact", {
        key: contact.contactId,
        throws: true,
      });
      await rateLimiter.limit(ctx, "emailWorkflowEventGlobal", {
        throws: true,
      });
    }

    const contactSyncOperationId = await enqueueEmailProviderOperation(ctx, {
      contactId: contact.contactId,
      kind: "contactSync",
      now: args.capturedAt,
    });

    if (enrollment.created) {
      const operationId = await enqueueEmailProviderOperation(ctx, {
        contactId: contact.contactId,
        dependsOnOperationId: contactSyncOperationId,
        enrollmentId: enrollment.enrollmentId,
        gateMode: args.gateMode,
        kind: "workflowEvent",
        leadSegment,
        now: args.capturedAt,
        toolSource: args.source,
        workflowKey: "tool_lead_captured",
        workflowVersion: "v1",
      });
      await ctx.db.patch(enrollment.enrollmentId, { operationId });
    }

    if (emailNativeEnrollment?.created && emailNativeWorkflowKey) {
      const operationId = await enqueueEmailProviderOperation(ctx, {
        contactId: contact.contactId,
        dependsOnOperationId: contactSyncOperationId,
        enrollmentId: emailNativeEnrollment.enrollmentId,
        gateMode: "email-native",
        kind: "workflowEvent",
        leadSegment,
        now: args.capturedAt,
        toolSource: args.source,
        workflowKey: emailNativeWorkflowKey,
        workflowVersion: "v1",
      });
      await ctx.db.patch(emailNativeEnrollment.enrollmentId, { operationId });
    }

    return { accepted: true as const };
  },
});
