import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { getPrimaryProductForOwner } from "./getPrimaryProductForOwner";

export async function getDefaultProductForOwner(
  ctx: MutationCtx,
  ownerId: string,
): Promise<Doc<"products"> | null> {
  return await getPrimaryProductForOwner(ctx, ownerId);
}
