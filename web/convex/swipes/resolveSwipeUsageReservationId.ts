export function resolveSwipeUsageReservationId(
  storedUsageReservationId: string | undefined,
  requestedUsageReservationId: string | undefined,
) {
  if (
    storedUsageReservationId &&
    requestedUsageReservationId &&
    storedUsageReservationId !== requestedUsageReservationId
  ) {
    throw new Error("Swipe already has a different usage reservation.");
  }

  return requestedUsageReservationId ?? storedUsageReservationId;
}
