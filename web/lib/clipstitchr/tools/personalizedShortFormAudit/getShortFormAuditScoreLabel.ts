export function getShortFormAuditScoreLabel(score: number) {
  if (score >= 85) return "Strong system with a few useful refinements";
  if (score >= 65) return "Good foundation with visible bottlenecks";
  if (score >= 40) return "Working pieces without a dependable system yet";
  return "Build the foundation before adding more output";
}
