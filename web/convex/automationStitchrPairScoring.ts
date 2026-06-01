export type StitchrPairCandidate = {
  demoClipId: string;
  demoLastUsedAt?: string;
  pairLastUsedAt?: string;
  pairUseCount: number;
  ugcClipId: string;
  ugcLastUsedAt?: string;
  wasUsedInPreviousRun: boolean;
};

export type SelectedStitchrPair = {
  candidate: StitchrPairCandidate;
  score: number;
};

function daysSince(date: string | undefined, nowMs: number) {
  if (!date) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = Date.parse(date);

  if (!Number.isFinite(timestamp)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, (nowMs - timestamp) / 86400000);
}

function freshnessBonus(date: string | undefined, nowMs: number) {
  const ageDays = daysSince(date, nowMs);

  if (!Number.isFinite(ageDays)) {
    return 4;
  }

  if (ageDays >= 14) {
    return 3;
  }

  if (ageDays >= 7) {
    return 2;
  }

  if (ageDays >= 2) {
    return 0.5;
  }

  return -2;
}

function seededUnitInterval(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return ((hash >>> 0) % 1000000) / 1000000;
}

export function scoreStitchrPair(
  candidate: StitchrPairCandidate,
  nowMs: number,
) {
  const unusedPairBonus = candidate.pairUseCount === 0 ? 6 : 0;
  const exactPairRecentPenalty =
    daysSince(candidate.pairLastUsedAt, nowMs) < 7 ? 5 : 0;
  const previousRunPenalty = candidate.wasUsedInPreviousRun ? 8 : 0;
  const useCountPenalty = Math.min(candidate.pairUseCount * 0.75, 5);

  return Math.max(
    0.1,
    1 +
      unusedPairBonus +
      freshnessBonus(candidate.ugcLastUsedAt, nowMs) +
      freshnessBonus(candidate.demoLastUsedAt, nowMs) -
      exactPairRecentPenalty -
      previousRunPenalty -
      useCountPenalty,
  );
}

export function selectStitchrPairs(
  candidates: StitchrPairCandidate[],
  limit: number,
  seed: string,
  nowMs: number,
) {
  return candidates
    .map((candidate): SelectedStitchrPair => {
      const score = scoreStitchrPair(candidate, nowMs);
      const randomFactor =
        0.75 +
        seededUnitInterval(
          `${seed}:${candidate.ugcClipId}:${candidate.demoClipId}`,
        ) *
          0.5;

      return {
        candidate,
        score: score * randomFactor,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(0, Math.floor(limit)));
}
