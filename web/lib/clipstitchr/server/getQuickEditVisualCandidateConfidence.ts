export function getQuickEditVisualCandidateConfidence({
  averageDifference,
  duration,
}: {
  averageDifference: number;
  duration: number;
}) {
  return Math.min(0.92, 0.55 + duration * 0.06 + (7 - averageDifference) * 0.04);
}
