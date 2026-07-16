import type { UsageReservationCommitBinding } from "../../lib/clipstitchr/usage/types/UsageReservationCommitBinding";

export function assertUsageReservationCommitBinding(
  reservation: {
    commitDomainId?: string;
    commitDomainKind?: string;
    domainId: string;
    domainKind: string;
    operation: string;
    reservationKind?: string;
    resource: string;
    state: string;
    workerQueueEntryId?: string;
  },
  binding: UsageReservationCommitBinding,
) {
  if (
    !binding.domainId.trim() ||
    !binding.domainKind.trim() ||
    reservation.domainId !== binding.domainId ||
    reservation.domainKind !== binding.domainKind ||
    reservation.operation !== binding.operation ||
    reservation.resource !== binding.resource ||
    reservation.reservationKind !== binding.reservationKind ||
    (binding.reservationKind === "worker" && !reservation.workerQueueEntryId) ||
    (reservation.state === "committed" &&
      (reservation.commitDomainKind !== binding.domainKind ||
        reservation.commitDomainId !== binding.domainId))
  ) {
    throw new Error("Usage reservation does not match this creation.");
  }
}
