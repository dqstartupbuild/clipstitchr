import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { getEmailOperationDispatchEligibility } from "./getEmailOperationDispatchEligibility";

export const getEmailProviderDispatchProjection = internalQuery({
  args: {
    now: v.number(),
    operationId: v.id("emailProviderOperations"),
    workerId: v.string(),
  },
  handler: async (ctx, { now, operationId, workerId }) => {
    const operation = await ctx.db.get(operationId);

    if (
      !operation ||
      operation.status !== "claimed" ||
      operation.leaseOwner !== workerId ||
      operation.leaseExpiresAt === undefined ||
      operation.leaseExpiresAt <= now
    ) {
      return null;
    }

    const contact = await ctx.db.get(operation.contactId);
    const tombstones = contact
      ? await ctx.db
          .query("providerDeletionTombstones")
          .withIndex("by_provider_contact_key", (query) =>
            query.eq("providerContactKey", contact.providerContactKey),
          )
          .collect()
      : [];
    const activeTombstone =
      tombstones.find((tombstone) => tombstone.clearedAt === undefined) ?? null;

    if (
      !contact ||
      !getEmailOperationDispatchEligibility({
        contact,
        operation,
        tombstone: activeTombstone,
      }).eligible ||
      (operation.kind !== "contactDelete" &&
        operation.kind !== "contactUnsubscribe" &&
        (!contact.firstTool || !contact.latestTool))
    ) {
      return null;
    }

    const confirmationToken = operation.confirmationTokenId
      ? await ctx.db.get(operation.confirmationTokenId)
      : null;
    const enrollment = operation.enrollmentId
      ? await ctx.db.get(operation.enrollmentId)
      : null;

    if (
      operation.confirmationTokenId &&
      (!confirmationToken ||
        confirmationToken.usedAt !== undefined ||
        confirmationToken.supersededAt !== undefined ||
        confirmationToken.expiresAt <= now)
    ) {
      return null;
    }

    if (
      operation.kind === "workflowEvent" &&
      (!enrollment ||
        enrollment.operationId !== operation._id ||
        enrollment.status !== "pending")
    ) {
      return null;
    }

    return {
      operation: {
        acceptanceStatus: operation.acceptanceStatus,
        attemptCount: operation.attemptCount,
        createdAt: operation.createdAt,
        idempotencyExpiresAt: operation.idempotencyExpiresAt,
        kind: operation.kind,
        operationId: operation._id,
      },
      contact: {
        contactName: contact.contactName,
        firstTool: contact.firstTool,
        latestTool: contact.latestTool,
        leadSegment: contact.leadSegment,
        leadStage: contact.leadStage,
        normalizedEmail: contact.normalizedEmail,
        providerContactId: contact.providerContactId,
        providerContactKey: contact.providerContactKey,
      },
      confirmation: confirmationToken
        ? {
            expiresAt: confirmationToken.expiresAt,
            generation: confirmationToken.generation,
            tokenDigest: confirmationToken.tokenDigest,
            tokenRecordId: confirmationToken.tokenRecordId,
          }
        : null,
      workflow: enrollment
        ? {
            enrollmentId: enrollment._id,
            gateMode: operation.gateMode,
            leadSegment: operation.leadSegment,
            status: enrollment.status,
            toolSource: operation.toolSource,
            workflowKey: enrollment.workflowKey,
            workflowVersion: enrollment.workflowVersion,
          }
        : null,
      transactionalTemplateKey: operation.transactionalTemplateKey ?? null,
    };
  },
});
