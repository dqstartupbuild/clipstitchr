import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import { enqueueAccountCommunication } from "./enqueueAccountCommunication";
import { getAccountCommunicationDate } from "./getAccountCommunicationDate";

export async function createInvoicePaidCommunication(
  ctx: MutationCtx,
  args: {
    creditsAdded: number;
    disabledDailyDraftCount: number;
    eventId: string;
    invoiceId: string;
    kind: "activation" | "plan-change" | "recovery" | "renewal";
    lockedProductCount: number;
    now: string;
    ownerId: string;
    periodEnd: string;
    planKey: PlanKey;
  },
) {
  const policy = getPlanPolicy(args.planKey);
  const title =
    args.kind === "activation"
      ? `Your ${policy.name} plan is active`
      : args.kind === "plan-change"
        ? `You’re now on ${policy.name}`
        : args.kind === "recovery"
          ? "Your billing is back on track"
          : "Your monthly credits are ready";
  const limits = [
    args.lockedProductCount > 0
      ? `${args.lockedProductCount} ${args.lockedProductCount === 1 ? "product is" : "products are"} locked until your plan supports them.`
      : "",
    args.disabledDailyDraftCount > 0
      ? `Daily drafts were turned off for ${args.disabledDailyDraftCount} ${args.disabledDailyDraftCount === 1 ? "product" : "products"}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  const creditCopy =
    args.creditsAdded > 0
      ? `${args.creditsAdded.toLocaleString("en-US")} creation credits were added.`
      : "Your current credit balance stays available.";
  const message = `${title}. ${creditCopy} Your current period runs through ${getAccountCommunicationDate(args.periodEnd)}.${limits ? ` ${limits}` : ""} Open Settings to review your plan and usage.`;

  return await enqueueAccountCommunication(ctx, {
    communicationKey: `invoice:${args.invoiceId}:paid`,
    createdAt: args.now,
    dataVariables:
      args.kind === "renewal"
        ? {
            creditsAdded: args.creditsAdded,
            expiresOn: getAccountCommunicationDate(args.periodEnd),
            headline: title,
            summary: message,
          }
        : {
            effectiveDate: getAccountCommunicationDate(args.now),
            headline: title,
            planName: policy.name,
            summary: message,
          },
    message,
    ownerId: args.ownerId,
    preview: `${creditCopy} Review your plan in Settings.`,
    sourceId: args.eventId,
    sourceType: args.kind === "renewal" ? "credit" : "billing",
    templateKey:
      args.kind === "renewal" ? "credits-updated" : "subscription-status",
    title,
  });
}
