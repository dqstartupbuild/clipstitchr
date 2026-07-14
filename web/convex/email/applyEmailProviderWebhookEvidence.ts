import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type EmailProviderWebhookDeliveryStatus =
  | "bounced"
  | "complained"
  | "delivered";

export async function applyEmailProviderWebhookEvidence(
  ctx: MutationCtx,
  args: {
    deliveryStatus?: EmailProviderWebhookDeliveryStatus;
    eventAt: number;
    operationId: Id<"emailProviderOperations">;
    receivedAt: number;
  },
) {
  const operation = await ctx.db.get(args.operationId);

  if (!operation) return false;

  const preservesLogicalCancellation =
    operation.status === "canceled" || operation.status === "superseded";
  const status = preservesLogicalCancellation
    ? operation.status
    : args.deliveryStatus === "delivered"
      ? ("delivered" as const)
      : args.deliveryStatus === undefined && operation.status === "delivered"
        ? ("delivered" as const)
        : ("accepted" as const);
  const delivered = args.deliveryStatus === "delivered";

  await ctx.db.patch(operation._id, {
    status,
    acceptanceStatus: "accepted",
    acceptedAt: Math.min(operation.acceptedAt ?? args.eventAt, args.eventAt),
    attemptLeaseOwner: undefined,
    leaseOwner: undefined,
    leaseExpiresAt: undefined,
    ...(args.deliveryStatus
      ? {
          deliveryStatus: args.deliveryStatus,
          deliveryChangedAt: args.eventAt,
          deliveredAt: delivered
            ? Math.min(operation.deliveredAt ?? args.eventAt, args.eventAt)
            : operation.deliveredAt,
        }
      : {}),
    terminalAt: Math.max(operation.terminalAt ?? args.eventAt, args.eventAt),
    updatedAt: Math.max(operation.updatedAt, args.receivedAt),
  });

  return true;
}
