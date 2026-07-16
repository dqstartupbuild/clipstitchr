import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import { enqueueAccountCommunication } from "./enqueueAccountCommunication";
import { getAccountCommunicationDate } from "./getAccountCommunicationDate";

export async function createSubscriptionCommunication(
  ctx: MutationCtx,
  args: {
    eventId: string;
    kind: "cancel-reversed" | "cancel-scheduled" | "ended";
    now: string;
    ownerId: string;
    periodEnd: string;
    planKey: PlanKey;
    subscriptionId: string;
  },
) {
  const policy = getPlanPolicy(args.planKey);
  const title =
    args.kind === "cancel-scheduled"
      ? "Your plan is set to end"
      : args.kind === "cancel-reversed"
        ? "Your plan will continue"
        : "Your plan has ended";
  const summary =
    args.kind === "cancel-scheduled"
      ? `Your ${policy.name} plan stays active through ${getAccountCommunicationDate(args.periodEnd)}. It will not renew after that date.`
      : args.kind === "cancel-reversed"
        ? `Your ${policy.name} plan will continue and renew on ${getAccountCommunicationDate(args.periodEnd)}.`
        : `Your ${policy.name} plan has ended. Your products and past work are still saved. Open Settings whenever you’re ready to restart.`;

  return await enqueueAccountCommunication(ctx, {
    communicationKey: `subscription:${args.subscriptionId}:${args.kind}:${args.eventId}`,
    createdAt: args.now,
    dataVariables: {
      effectiveDate: getAccountCommunicationDate(
        args.kind === "ended" ? args.now : args.periodEnd,
      ),
      headline: title,
      planName: policy.name,
      summary,
    },
    message: `${summary} Open Settings to manage billing.`,
    ownerId: args.ownerId,
    preview: summary,
    sourceId: args.eventId,
    sourceType: "billing",
    templateKey: "subscription-status",
    title,
  });
}
