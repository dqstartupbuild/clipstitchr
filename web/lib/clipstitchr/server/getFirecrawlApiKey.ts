export function getFirecrawlApiKey() {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is required to import website details.");
  }

  return apiKey;
}
