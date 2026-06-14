export function getStitchScoreLabel(score: number) {
  if (score >= 80) {
    return "Strong stitch";
  }

  if (score >= 65) {
    return "Worth posting";
  }

  if (score >= 50) {
    return "Needs a trim";
  }

  return "Fix before posting";
}
