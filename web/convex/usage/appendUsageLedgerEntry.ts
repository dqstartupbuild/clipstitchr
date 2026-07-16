import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import type { UsageLedgerOperation } from "../../lib/clipstitchr/usage/types/UsageLedgerOperation";
import type { UsageResource } from "../../lib/clipstitchr/usage/types/UsageResource";

type LedgerEntryType =
  | "grant"
  | "reserve"
  | "commit"
  | "release"
  | "expire"
  | "adjust"
  | "revoke"
  | "reverse";

type LedgerSource =
  | "stripe_webhook"
  | "user_action"
  | "worker"
  | "reconciler"
  | "support";

export async function appendUsageLedgerEntry(
  ctx: MutationCtx,
  entry: {
    availableDelta: number;
    batchId?: string;
    consumedDelta: number;
    createdAt: string;
    domainId?: string;
    domainKind: string;
    entryType: LedgerEntryType;
    grantId?: string;
    idempotencyKey: string;
    operation: UsageLedgerOperation;
    ownerId: string;
    periodKey?: string;
    planKeySnapshot: PlanKey;
    quantity: number;
    reason?: string;
    reservationId?: string;
    reservedDelta: number;
    resource: UsageResource;
    source: LedgerSource;
    stripeSourceId?: string;
    supportActor?: string;
  },
) {
  const existing = await ctx.db
    .query("usageLedgerEntries")
    .withIndex("by_idempotency_key", (query) =>
      query.eq("idempotencyKey", entry.idempotencyKey),
    )
    .unique();

  if (existing) {
    return existing._id;
  }

  const { planKeySnapshot: _planKeySnapshot, ...storedEntry } = entry;

  return await ctx.db.insert("usageLedgerEntries", {
    ...storedEntry,
    ledgerEntryId: entry.idempotencyKey,
  });
}
