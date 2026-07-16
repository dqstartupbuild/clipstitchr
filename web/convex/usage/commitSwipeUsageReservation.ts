import type { MutationCtx } from "../_generated/server";
import { commitUsageReservationForOwner } from "./commitUsageReservation";
import { reacquireUsageReservation } from "./reacquireUsageReservation";

export async function commitSwipeUsageReservation(
  ctx: MutationCtx,
  ownerId: string,
  reservationId: string | undefined,
  now: string,
  source: "user_action" | "worker",
) {
  if (!reservationId) {
    return undefined;
  }

  const committedReservationId = await reacquireUsageReservation(
    ctx,
    ownerId,
    reservationId,
    now,
  );
  await commitUsageReservationForOwner(
    ctx,
    ownerId,
    committedReservationId,
    now,
    source,
  );

  return committedReservationId;
}
