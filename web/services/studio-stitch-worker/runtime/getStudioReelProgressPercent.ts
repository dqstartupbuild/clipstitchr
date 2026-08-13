export function getStudioReelProgressPercent(
  recipeIndex: number,
  recipeCount: number,
  stage: "sources" | "gemini" | "voice" | "rendered" | "stored",
) {
  const fraction = {
    sources: 0.15,
    gemini: 0.3,
    voice: 0.45,
    rendered: 0.8,
    stored: 1,
  }[stage];
  return Math.min(
    99,
    Math.floor(((recipeIndex + fraction) / recipeCount) * 99),
  );
}
