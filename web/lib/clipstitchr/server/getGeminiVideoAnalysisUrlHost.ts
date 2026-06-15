export function getGeminiVideoAnalysisUrlHost(sourceUrl?: string) {
  if (!sourceUrl) {
    return undefined;
  }

  try {
    return new URL(sourceUrl).host;
  } catch {
    return "invalid-url";
  }
}
