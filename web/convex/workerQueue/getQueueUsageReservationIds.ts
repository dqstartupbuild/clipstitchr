export function getQueueUsageReservationIds(entry: {
  usageReservationId?: string;
  usageReservationIds?: string[];
}) {
  return Array.from(
    new Set([
      ...(entry.usageReservationId ? [entry.usageReservationId] : []),
      ...(entry.usageReservationIds ?? []),
    ]),
  );
}
