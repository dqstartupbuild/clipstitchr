import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { enqueueContactDeleteCompensation } from "./enqueueContactDeleteCompensation";
import { enqueueContactUnsubscribeCompensation } from "./enqueueContactUnsubscribeCompensation";
import { getEmailProviderOperationIsTerminal } from "./getEmailProviderOperationIsTerminal";

export async function cancelEmailProviderOperationsForContact(
  ctx: MutationCtx,
  contactId: Id<"marketingContacts">,
  canceledAt: number,
  options: { providerDeletionFence?: boolean } = {},
) {
  const operations = await ctx.db
    .query("emailProviderOperations")
    .withIndex("by_contact_created", (query) =>
      query.eq("contactId", contactId),
    )
    .collect();
  let canceledCount = 0;

  for (const operation of operations) {
    if (operation.kind === "contactDelete") {
      continue;
    }

    if (
      operation.kind === "contactUnsubscribe" &&
      !options.providerDeletionFence
    ) {
      continue;
    }

    if (
      options.providerDeletionFence &&
      operation.attemptCount >= 1 &&
      (operation.status === "claimed" ||
        operation.acceptanceStatus === "unknown" ||
        operation.ambiguousAt !== undefined)
    ) {
      await enqueueContactDeleteCompensation(ctx, {
        compensatesOperationId: operation._id,
        contactId: operation.contactId,
        notBefore: operation.idempotencyExpiresAt + 1_000,
        now: canceledAt,
      });
    }

    if (
      !options.providerDeletionFence &&
      operation.kind === "contactResubscribe" &&
      operation.acceptanceStatus === "accepted" &&
      operation.status !== "canceled"
    ) {
      await enqueueContactUnsubscribeCompensation(ctx, {
        compensatesOperationId: operation._id,
        contactId: operation.contactId,
        now: canceledAt,
      });
    }

    if (getEmailProviderOperationIsTerminal(operation.status)) continue;

    await ctx.db.patch(operation._id, {
      status: "canceled",
      ...(operation.status === "claimed" &&
      operation.attemptLeaseOwner &&
      operation.acceptanceStatus !== "accepted"
        ? {
            acceptanceStatus: "unknown" as const,
            ambiguousAt: operation.ambiguousAt ?? canceledAt,
          }
        : {}),
      failureCategory: "ineligible",
      attemptLeaseOwner: undefined,
      leaseOwner: undefined,
      leaseExpiresAt: undefined,
      terminalAt: canceledAt,
      updatedAt: canceledAt,
    });
    canceledCount += 1;
  }

  return canceledCount;
}
