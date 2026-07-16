import type { MutationCtx } from "../_generated/server";
import { getIsUsageLimitError } from "./getIsUsageLimitError";
import { reserveAiVideoForOwner } from "./reserveAiVideo";

export async function tryReserveAiVideoForAutomation(
  ctx: MutationCtx,
  args: {
    batchId?: string;
    domainId: string;
    idempotencyKey: string;
    now: string;
    operation: "clipr_video" | "swapr_video";
    ownerId: string;
  },
) {
  try {
    return await reserveAiVideoForOwner(ctx, args.ownerId, {
      batchId: args.batchId,
      domainId: args.domainId,
      domainKind: "automation_task",
      idempotencyKey: args.idempotencyKey,
      now: args.now,
      operation: args.operation,
      source: "worker",
    });
  } catch (error) {
    if (getIsUsageLimitError(error)) {
      return null;
    }

    throw error;
  }
}
