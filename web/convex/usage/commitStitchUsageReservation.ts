import type { MutationCtx } from "../_generated/server";
import type { UsageReservationCommitBinding } from "../../lib/clipstitchr/usage/types/UsageReservationCommitBinding";
import { commitUsageReservationForOwner } from "./commitUsageReservation";
import { reacquireUsageReservation } from "./reacquireUsageReservation";

export async function commitStitchUsageReservation(
  ctx: MutationCtx,
  ownerId: string,
  reservationId: string | undefined,
  now: string,
  source: "user_action" | "worker",
  binding: UsageReservationCommitBinding,
) {
  if (!reservationId) {
    return undefined;
  }

  const committedReservationId = await reacquireUsageReservation(
    ctx,
    ownerId,
    reservationId,
    now,
    binding,
  );
  await commitUsageReservationForOwner(
    ctx,
    ownerId,
    committedReservationId,
    now,
    source,
    binding,
  );

  return committedReservationId;
}
