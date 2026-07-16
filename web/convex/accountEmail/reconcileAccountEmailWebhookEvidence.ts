import type { MutationCtx } from "../_generated/server";
import { getAccountEmailTemplateKeyForTransactionalId } from "../../lib/clipstitchr/email/loops/getAccountEmailTemplateKeyForTransactionalId";
import { normalizeToolLeadEmail } from "../../lib/clipstitchr/tools/toolLeads/normalizeToolLeadEmail";
import { applyAccountEmailWebhookEvidence } from "./applyAccountEmailWebhookEvidence";
import { cancelAccountEmailOperationsForOwner } from "./cancelAccountEmailOperationsForOwner";

export async function reconcileAccountEmailWebhookEvidence(
  ctx: MutationCtx,
  args: {
    contactEmail: string | null;
    eventAt: number;
    eventName: string;
    providerEmailId: string | null;
    providerSourceId: string | null;
    receivedAt: number;
    sourceType: string | null;
  },
) {
  const templateKey = getAccountEmailTemplateKeyForTransactionalId(
    args.sourceType === "transactional" ? args.providerSourceId : null,
    process.env,
  );

  if (!templateKey || !args.contactEmail || !args.providerEmailId) {
    return { matched: false as const };
  }

  let operation = await ctx.db
    .query("accountEmailOperations")
    .withIndex("by_provider_message_id", (query) =>
      query.eq("providerMessageId", args.providerEmailId ?? undefined),
    )
    .unique();
  let contact = null;

  if (!operation) {
    const contacts = await ctx.db
      .query("accountContacts")
      .withIndex("by_normalized_email", (query) =>
        query.eq(
          "normalizedEmail",
          normalizeToolLeadEmail(args.contactEmail!),
        ),
      )
      .collect();
    const activeContacts = contacts.filter(
      (candidate) =>
        candidate.deletedAt === undefined && candidate.emailVerified,
    );

    if (activeContacts.length !== 1) {
      return { matched: false as const };
    }

    contact = activeContacts[0] ?? null;
    const operations = await ctx.db
      .query("accountEmailOperations")
      .withIndex("by_owner_created", (query) =>
        query.eq("ownerId", contact!.ownerId),
      )
      .order("desc")
      .take(100);
    const candidates = operations.filter(
      (candidate) =>
        candidate.templateKey === templateKey &&
        candidate.providerMessageId === undefined &&
        (candidate.status === "accepted" ||
          candidate.status === "delivered") &&
        candidate.acceptedAt !== undefined &&
        candidate.acceptedAt <= args.eventAt + 5 * 60 * 1_000 &&
        candidate.acceptedAt >= args.eventAt - 24 * 60 * 60 * 1_000,
    );

    if (candidates.length !== 1) {
      return { matched: false as const };
    }

    operation = candidates[0] ?? null;
  } else {
    contact = await ctx.db
      .query("accountContacts")
      .withIndex("by_owner", (query) =>
        query.eq("ownerId", operation!.ownerId),
      )
      .unique();
  }

  if (!operation || !contact || operation.templateKey !== templateKey) {
    return { matched: false as const };
  }

  const deliveryStatus =
    args.eventName === "email.delivered"
      ? ("delivered" as const)
      : args.eventName === "email.spamReported"
        ? ("complained" as const)
        : args.eventName === "email.hardBounced" ||
            args.eventName === "email.softBounced"
          ? ("bounced" as const)
          : undefined;
  const applied = await applyAccountEmailWebhookEvidence(ctx, {
    deliveryStatus,
    eventAt: args.eventAt,
    operationId: operation._id,
    providerMessageId: args.providerEmailId,
    receivedAt: args.receivedAt,
  });

  if (
    applied &&
    (args.eventName === "email.hardBounced" ||
      args.eventName === "email.spamReported")
  ) {
    await ctx.db.patch(contact._id, {
      emailSuppressedAt: args.eventAt,
      emailSuppressionReason:
        args.eventName === "email.spamReported" ? "complaint" : "hardBounce",
      updatedAt: Math.max(contact.updatedAt, args.receivedAt),
    });
    await cancelAccountEmailOperationsForOwner(ctx, {
      canceledAt: args.receivedAt,
      ownerId: contact.ownerId,
    });
  }

  return {
    disposition: applied ? ("applied" as const) : ("ignoredStale" as const),
    matched: true as const,
    operationId: operation._id,
  };
}
