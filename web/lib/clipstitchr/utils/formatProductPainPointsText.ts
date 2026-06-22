export function formatProductPainPointsText(painPoints: string[]) {
  return painPoints.map((painPoint) => painPoint.trim()).filter(Boolean).join("\n");
}
