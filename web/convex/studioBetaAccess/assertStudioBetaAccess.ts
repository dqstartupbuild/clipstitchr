import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getStudioBetaAccessStateForOwner } from "./getStudioBetaAccessStateForOwner";

export async function assertStudioBetaAccess(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
) {
  const accessState = await getStudioBetaAccessStateForOwner(ctx, ownerId);

  if (!accessState.hasAccess) {
    throw new Error("Studio Beta access denied.");
  }

  return accessState;
}
