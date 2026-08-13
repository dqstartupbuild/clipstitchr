export function isFiniteStudioStitchNumber(
  candidate: unknown,
): candidate is number {
  return typeof candidate === "number" && Number.isFinite(candidate);
}
