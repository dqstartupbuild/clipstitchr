export function getClipPerformanceScoreLabel(score: number) {
  if (score >= 80) {
    return "Worth using";
  }

  if (score >= 65) {
    return "Good with a trim";
  }

  if (score >= 50) {
    return "Needs a quick fix";
  }

  return "Skip for now";
}
