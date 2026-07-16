import type { MutationCtx } from "../_generated/server";
import { enqueueAccountEmailOperation } from "./enqueueAccountEmailOperation";

export async function createAccountCreatedCommunication(
  ctx: MutationCtx,
  args: { now: number; ownerId: string },
) {
  return await enqueueAccountEmailOperation(ctx, {
    communicationKey: "account-created:v1",
    dataVariables: {},
    now: args.now,
    ownerId: args.ownerId,
    templateKey: "account-created",
  });
}
