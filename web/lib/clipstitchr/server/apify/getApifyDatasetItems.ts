import { createApifyDatasetItemsUrl } from "@/lib/clipstitchr/server/apify/createApifyDatasetItemsUrl";
import { fetchApifyJson } from "@/lib/clipstitchr/server/apify/fetchApifyJson";
import { getApifyApiToken } from "@/lib/clipstitchr/server/apify/getApifyApiToken";

type GetApifyDatasetItemsOptions = {
  datasetId: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  token?: string;
};

export async function getApifyDatasetItems({
  datasetId,
  fetcher,
  timeoutMs,
  token = getApifyApiToken(),
}: GetApifyDatasetItemsOptions) {
  const response = await fetchApifyJson(
    createApifyDatasetItemsUrl(datasetId, token),
    { method: "GET" },
    fetcher,
    timeoutMs,
  );

  if (!Array.isArray(response)) {
    throw new Error("Apify returned an invalid dataset.");
  }

  return response.slice(0, 1) as unknown[];
}
