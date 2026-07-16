import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getAccountEmailDeliveryEventIsStale } from "./getAccountEmailDeliveryEventIsStale";

export async function applyAccountEmailWebhookEvidence(
  ctx: MutationCtx,
  args: {
    deliveryStatus?: "bounced" | "complained" | "delivered";
    eventAt: number;
    operationId: Id<"accountEmailOperations">;
    providerMessageId: string;
    receivedAt: number;
  },
) {
  const operation = await ctx.db.get(args.operationId);

  if (
    !operation ||
    (args.deliveryStatus &&
      getAccountEmailDeliveryEventIsStale(
        operation,
        args.eventAt,
        args.deliveryStatus,
      ))
  ) {
    return false;
  }

  await ctx.db.patch(operation._id, {
    acceptanceStatus: "accepted",
    acceptedAt: Math.min(operation.acceptedAt ?? args.eventAt, args.eventAt),
    attemptLeaseOwner: undefined,
    deliveryChangedAt: args.deliveryStatus
      ? args.eventAt
      : operation.deliveryChangedAt,
    deliveryStatus: args.deliveryStatus ?? operation.deliveryStatus,
    deliveredAt:
      args.deliveryStatus === "delivered"
        ? Math.min(operation.deliveredAt ?? args.eventAt, args.eventAt)
        : operation.deliveredAt,
    leaseExpiresAt: undefined,
    leaseOwner: undefined,
    providerMessageId: args.providerMessageId,
    status:
      args.deliveryStatus === "delivered" ? "delivered" : "accepted",
    terminalAt: Math.max(operation.terminalAt ?? args.eventAt, args.eventAt),
    updatedAt: Math.max(operation.updatedAt, args.receivedAt),
  });

  return true;
}
