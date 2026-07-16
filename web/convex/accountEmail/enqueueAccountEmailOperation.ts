import type { MutationCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { AccountEmailDataVariables } from "../../lib/clipstitchr/email/loops/AccountEmailDataVariables";
import type { AccountEmailTemplateKey } from "../../lib/clipstitchr/email/loops/AccountEmailTemplateKey";
import { emailProviderIdempotencyLifetimeMs } from "../email/emailProviderIdempotencyLifetimeMs";

export async function enqueueAccountEmailOperation(
  ctx: MutationCtx,
  args: {
    communicationKey: string;
    dataVariables: AccountEmailDataVariables;
    now: number;
    ownerId: string;
    templateKey: AccountEmailTemplateKey;
  },
) {
  const communicationKey = `account:${args.ownerId}:${args.communicationKey}`;
  const existing = await ctx.db
    .query("accountEmailOperations")
    .withIndex("by_communication_key", (query) =>
      query.eq("communicationKey", communicationKey),
    )
    .unique();

  if (existing) {
    return { created: false as const, operationId: existing._id };
  }

  const operationId = await ctx.db.insert("accountEmailOperations", {
    acceptanceStatus: "notAttempted",
    attemptCount: 0,
    communicationKey,
    createdAt: args.now,
    dataVariables: { ...args.dataVariables },
    deliveryStatus: "pending",
    idempotencyExpiresAt:
      args.now + emailProviderIdempotencyLifetimeMs,
    nextAttemptAt: args.now,
    ownerId: args.ownerId,
    status: "pending",
    templateKey: args.templateKey,
    updatedAt: args.now,
  });

  await ctx.scheduler.runAfter(
    0,
    internal.accountEmail.processAccountEmailOperation
      .processAccountEmailOperation,
    { operationId },
  );

  return { created: true as const, operationId };
}
