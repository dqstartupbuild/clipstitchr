import type { MutationCtx } from "../_generated/server";
import type { UsageOperation } from "../../lib/clipstitchr/usage/types/UsageOperation";
import { getIsUsageLimitError } from "./getIsUsageLimitError";
import { reserveCreationCreditsForOwner } from "./reserveCreationCredits";

export async function tryReserveCreationCreditsForAutomation(
  ctx: MutationCtx,
  args: {
    batchId?: string;
    domainId: string;
    idempotencyKey: string;
    now: string;
    operation: UsageOperation;
    ownerId: string;
  },
) {
  try {
    return await reserveCreationCreditsForOwner(ctx, args.ownerId, {
      batchId: args.batchId,
      domainId: args.domainId,
      domainKind: "automation_task",
      idempotencyKey: args.idempotencyKey,
      now: args.now,
      operation: args.operation,
      reservationKind: "worker",
      source: "worker",
    });
  } catch (error) {
    if (getIsUsageLimitError(error)) {
      return null;
    }

    throw error;
  }
}
