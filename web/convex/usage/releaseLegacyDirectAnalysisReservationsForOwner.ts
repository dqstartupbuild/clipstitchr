import type { MutationCtx } from "../_generated/server";
import { releaseUsageReservationForOwner } from "./releaseUsageReservation";

export async function releaseLegacyDirectAnalysisReservationsForOwner(
  ctx: MutationCtx,
  ownerId: string,
  now: string,
) {
  const reservations = await ctx.db
    .query("usageReservations")
    .withIndex("by_owner_state", (query) =>
      query.eq("ownerId", ownerId).eq("state", "reserved"),
    )
    .take(100);
  let releasedCount = 0;

  for (const reservation of reservations) {
    const isLegacyDirectAnalysis =
      reservation.domainKind === "analysis" &&
      reservation.reservationKind === "worker" &&
      reservation.workerQueueEntryId === undefined &&
      (reservation.operation === "ai_analysis" ||
        reservation.operation === "hook_lab_script");

    if (!isLegacyDirectAnalysis) {
      continue;
    }

    await releaseUsageReservationForOwner(
      ctx,
      ownerId,
      reservation.reservationId,
      now,
      "Released a legacy direct-analysis reservation without queue work.",
    );
    releasedCount += 1;
  }

  return releasedCount;
}
