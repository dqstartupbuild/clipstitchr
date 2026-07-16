import type { MutationCtx } from "../_generated/server";
import { commitStitchUsageReservation } from "./commitStitchUsageReservation";
import { releaseGenerationSlot } from "../workerQueue/releaseGenerationSlot";

export async function commitUserStitchUsage(
  ctx: MutationCtx,
  args: {
    now: string;
    ownerId: string;
    stitchId: string;
    usageIdempotencyKey?: string;
    usageReservationId?: string;
  },
) {
  if (args.usageReservationId) {
    return await commitStitchUsageReservation(
      ctx,
      args.ownerId,
      args.usageReservationId,
      args.now,
      "user_action",
      {
        domainId: args.stitchId,
        domainKind: "stitch",
        operation: "stitch",
        reservationKind: "browser",
        resource: "creation_credit",
      },
    );
  }

  if (!args.usageIdempotencyKey) {
    throw new Error("This Stitch is missing its creation usage record.");
  }

  const event = await ctx.db
    .query("zeroCostUsageEvents")
    .withIndex("by_idempotency_key", (query) =>
      query.eq("idempotencyKey", args.usageIdempotencyKey!),
    )
    .unique();

  if (
    !event ||
    event.ownerId !== args.ownerId ||
    event.operation !== "stitch" ||
    event.domainId !== args.stitchId ||
    event.planKeySnapshot !== "agency"
  ) {
    throw new Error("This Stitch is missing its Agency usage record.");
  }

  await releaseGenerationSlot(
    ctx,
    event.generationSlotId,
    args.now,
    "Browser Stitch completed",
  );

  return undefined;
}
