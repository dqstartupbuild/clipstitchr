import { createApifyDatasetItemsUrl } from "@/lib/clipstitchr/server/apify/createApifyDatasetItemsUrl";
import { fetchApifyJson } from "@/lib/clipstitchr/server/apify/fetchApifyJson";
import { getApifyApiToken } from "@/lib/clipstitchr/server/apify/getApifyApiToken";

export async function getSocialAnalyticsApifyDatasetItems(
  datasetId: string,
  limit: number,
) {
  const url = new URL(
    createApifyDatasetItemsUrl(datasetId, getApifyApiToken()),
  );
  url.searchParams.set("limit", String(limit));
  const response = await fetchApifyJson(url.toString(), { method: "GET" });

  if (!Array.isArray(response)) {
    throw new Error("TikTok save enrichment returned an invalid dataset.");
  }

  return response.slice(0, limit) as unknown[];
}
