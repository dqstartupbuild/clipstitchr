export function createApifyDatasetItemsUrl(datasetId: string, token: string) {
  const normalizedDatasetId = datasetId.trim();
  const normalizedToken = token.trim();

  if (!normalizedDatasetId || !normalizedToken) {
    throw new Error("Apify dataset ID and API token are required.");
  }

  const url = new URL(
    `https://api.apify.com/v2/datasets/${encodeURIComponent(normalizedDatasetId)}/items`,
  );

  url.searchParams.set("token", normalizedToken);
  url.searchParams.set("clean", "true");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  return url.toString();
}
