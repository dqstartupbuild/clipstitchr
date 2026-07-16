import type { MutationCtx } from "../_generated/server";
import { enqueueAccountCommunication } from "./enqueueAccountCommunication";
import { getAccountCommunicationDate } from "./getAccountCommunicationDate";

export async function createPaymentFailureCommunication(
  ctx: MutationCtx,
  args: {
    eventId: string;
    graceEndsAt?: string;
    invoiceId: string;
    now: string;
    ownerId: string;
  },
) {
  const title = "Payment needs attention";
  const summary = args.graceEndsAt
    ? `We couldn’t complete your renewal. Your account stays available through ${getAccountCommunicationDate(args.graceEndsAt)} while you update your payment method.`
    : "We couldn’t complete your first payment, so paid access has not started. Update your payment method in Settings and try again.";

  return await enqueueAccountCommunication(ctx, {
    communicationKey: `invoice:${args.invoiceId}:payment-failed`,
    createdAt: args.now,
    dataVariables: {
      graceEndsOn: args.graceEndsAt
        ? getAccountCommunicationDate(args.graceEndsAt)
        : "Before trying checkout again",
      headline: title,
      summary,
    },
    message: `${summary} Open Settings to manage billing.`,
    ownerId: args.ownerId,
    preview: summary,
    sourceId: args.eventId,
    sourceType: "billing",
    templateKey: "payment-alert",
    title,
  });
}
