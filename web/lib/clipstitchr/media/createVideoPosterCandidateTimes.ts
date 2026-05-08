const FIXED_POSTER_CANDIDATE_TIMES_SECONDS = [0.25, 0.5, 1, 1.5, 2.5, 4];
const RELATIVE_POSTER_CANDIDATE_TIMES = [0.1, 0.25, 0.5];
const POSTER_END_PADDING_SECONDS = 0.05;
const POSTER_TIME_PRECISION = 1000;

export function createVideoPosterCandidateTimes(duration: number) {
  const maxTime = Number.isFinite(duration)
    ? Math.max(0, duration - POSTER_END_PADDING_SECONDS)
    : 0;

  if (maxTime === 0) {
    return [0];
  }

  const times = new Set<number>();

  for (const fixedTime of FIXED_POSTER_CANDIDATE_TIMES_SECONDS) {
    times.add(Math.min(fixedTime, maxTime));
  }

  for (const relativeTime of RELATIVE_POSTER_CANDIDATE_TIMES) {
    times.add(Math.min(duration * relativeTime, maxTime));
  }

  return Array.from(times)
    .map((time) => Math.round(time * POSTER_TIME_PRECISION) / POSTER_TIME_PRECISION)
    .sort((left, right) => left - right);
}
