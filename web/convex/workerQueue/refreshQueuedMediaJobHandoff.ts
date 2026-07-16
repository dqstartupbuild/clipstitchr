import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function refreshQueuedMediaJobHandoff(
  ctx: MutationCtx,
  mediaJob: Doc<"mediaJobs">,
  args: {
    generationSlotId?: string;
    updatedAt: string;
    usageReservationId?: string;
  },
) {
  if (
    mediaJob.status !== "queued" ||
    !args.generationSlotId ||
    mediaJob.generationSlotId === args.generationSlotId
  ) {
    return mediaJob;
  }

  await ctx.db.patch(mediaJob._id, {
    generationSlotId: args.generationSlotId,
    updatedAt: args.updatedAt,
    usageReservationId: args.usageReservationId,
  });

  return (await ctx.db.get(mediaJob._id)) ?? mediaJob;
}
