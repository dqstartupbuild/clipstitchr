export function getOldestQueueCandidatePerOwner<
  Candidate extends { ownerId: string; queuedAt: string },
>(candidates: Candidate[]) {
  const oldestByOwner = new Map<string, Candidate>();

  for (const candidate of candidates) {
    const existing = oldestByOwner.get(candidate.ownerId);

    if (!existing || candidate.queuedAt < existing.queuedAt) {
      oldestByOwner.set(candidate.ownerId, candidate);
    }
  }

  return [...oldestByOwner.values()].sort((left, right) =>
    left.queuedAt.localeCompare(right.queuedAt),
  );
}
