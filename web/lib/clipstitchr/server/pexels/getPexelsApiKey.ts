export function getPexelsApiKey() {
  const apiKey = process.env.PEXELS_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Pexels search is not set up yet.");
  }

  return apiKey;
}
