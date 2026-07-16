import type { MutationCtx } from "../_generated/server";
import { getAccountEmailOperationIsTerminal } from "./getAccountEmailOperationIsTerminal";

export async function cancelAccountEmailOperationsForOwner(
  ctx: MutationCtx,
  args: { canceledAt: number; ownerId: string },
) {
  const operations = await ctx.db
    .query("accountEmailOperations")
    .withIndex("by_owner_created", (query) =>
      query.eq("ownerId", args.ownerId),
    )
    .order("asc")
    .take(100);
  let canceled = 0;

  for (const operation of operations) {
    if (getAccountEmailOperationIsTerminal(operation.status)) {
      continue;
    }

    await ctx.db.patch(operation._id, {
      attemptLeaseOwner: undefined,
      failureCategory: "ineligible",
      leaseExpiresAt: undefined,
      leaseOwner: undefined,
      status: "canceled",
      terminalAt: args.canceledAt,
      updatedAt: args.canceledAt,
    });
    canceled += 1;
  }

  return canceled;
}
