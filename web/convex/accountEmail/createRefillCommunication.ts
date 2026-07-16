import type { MutationCtx } from "../_generated/server";
import { creditRefillPolicy } from "../../lib/clipstitchr/billing/creditRefillPolicy";
import { enqueueAccountCommunication } from "./enqueueAccountCommunication";
import { getAccountCommunicationDate } from "./getAccountCommunicationDate";

export async function createRefillCommunication(
  ctx: MutationCtx,
  args: {
    eventId: string;
    expiresAt: string;
    now: string;
    ownerId: string;
    paymentIntentId: string;
  },
) {
  const title = `${creditRefillPolicy.amount.toLocaleString("en-US")} credits added`;
  const summary = `Your credit refill is ready. These credits expire on ${getAccountCommunicationDate(args.expiresAt)} and are available while this subscription remains active.`;

  return await enqueueAccountCommunication(ctx, {
    communicationKey: `refill:${args.paymentIntentId}:granted`,
    createdAt: args.now,
    dataVariables: {
      creditsAdded: creditRefillPolicy.amount,
      expiresOn: getAccountCommunicationDate(args.expiresAt),
      headline: title,
      summary,
    },
    message: `${summary} Open Settings to see your balance.`,
    ownerId: args.ownerId,
    preview: summary,
    sourceId: args.eventId,
    sourceType: "credit",
    templateKey: "credits-updated",
    title,
  });
}
