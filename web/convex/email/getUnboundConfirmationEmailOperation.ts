import type { Doc } from "../_generated/dataModel";

export function getUnboundConfirmationEmailOperation(
  operations: Doc<"emailProviderOperations">[],
  eventAt: number,
) {
  const eligible = operations.filter(
    (operation) =>
      operation.kind === "transactional" &&
      operation.transactionalTemplateKey === "email-confirmation" &&
      operation.providerMessageId === undefined &&
      operation.deliveryStatus === "pending" &&
      (operation.status === "claimed" ||
        operation.status === "accepted" ||
        ((operation.status === "pending" ||
          operation.status === "deadLetter") &&
          operation.acceptanceStatus === "unknown")),
  );

  return eligible.reduce<Doc<"emailProviderOperations"> | null>(
    (best, candidate) => {
      if (!best) return candidate;
      const candidateTime =
        candidate.status === "claimed"
          ? candidate.updatedAt
          : (candidate.acceptedAt ?? candidate.updatedAt);
      const bestTime =
        best.status === "claimed"
          ? best.updatedAt
          : (best.acceptedAt ?? best.updatedAt);
      const candidateDistance = Math.abs(eventAt - candidateTime);
      const bestDistance = Math.abs(eventAt - bestTime);

      if (candidateDistance !== bestDistance) {
        return candidateDistance < bestDistance ? candidate : best;
      }

      return candidate.createdAt < best.createdAt ? candidate : best;
    },
    null,
  );
}
