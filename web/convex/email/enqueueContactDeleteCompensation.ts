import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { emailProviderIdempotencyLifetimeMs } from "./emailProviderIdempotencyLifetimeMs";
import { enqueueEmailProviderOperation } from "./enqueueEmailProviderOperation";

export async function enqueueContactDeleteCompensation(
  ctx: MutationCtx,
  args: {
    compensatesOperationId: Id<"emailProviderOperations">;
    contactId: Id<"marketingContacts">;
    notBefore?: number;
    now: number;
  },
) {
  const contact = await ctx.db.get(args.contactId);

  if (
    !contact ||
    (contact.deletionStatus !== "privacyDeleted" &&
      contact.deletionStatus !== "providerDeleted")
  ) {
    return null;
  }

  const nextAttemptAt = Math.max(args.now, args.notBefore ?? args.now);
  const compensations = await ctx.db
    .query("emailProviderOperations")
    .withIndex("by_compensated_operation", (query) =>
      query.eq("compensatesOperationId", args.compensatesOperationId),
    )
    .collect();
  const existing = compensations.find(
    (operation) =>
      operation.kind === "contactDelete" &&
      operation.compensatesOperationId === args.compensatesOperationId,
  );

  if (!existing) {
    return await enqueueEmailProviderOperation(ctx, {
      compensatesOperationId: args.compensatesOperationId,
      contactId: args.contactId,
      kind: "contactDelete",
      nextAttemptAt,
      now: args.now,
    });
  }

  const shouldRearm =
    existing.status === "held" ||
    existing.status === "accepted" ||
    existing.status === "delivered" ||
    existing.status === "canceled" ||
    existing.status === "superseded" ||
    existing.status === "deadLetter";
  const shouldExpedite =
    existing.status === "pending" && existing.nextAttemptAt > nextAttemptAt;

  if (!shouldRearm && !shouldExpedite) return existing._id;

  await ctx.db.patch(existing._id, {
    ...(shouldRearm
      ? {
          acceptanceStatus: "notAttempted" as const,
          acceptedAt: undefined,
          ambiguousAt: undefined,
          attemptCount: 0,
          attemptLeaseOwner: undefined,
          failureCategory: undefined,
          idempotencyExpiresAt:
            nextAttemptAt + emailProviderIdempotencyLifetimeMs,
          leaseExpiresAt: undefined,
          leaseOwner: undefined,
          providerMessageId: undefined,
          status: "pending" as const,
          terminalAt: undefined,
        }
      : {}),
    nextAttemptAt,
    updatedAt: args.now,
  });

  if (nextAttemptAt > args.now) {
    await ctx.scheduler.runAt(
      nextAttemptAt,
      internal.email.processEmailProviderOperation.processEmailProviderOperation,
      { operationId: existing._id },
    );
  } else {
    await ctx.scheduler.runAfter(
      0,
      internal.email.processEmailProviderOperation.processEmailProviderOperation,
      { operationId: existing._id },
    );
  }

  return existing._id;
}
