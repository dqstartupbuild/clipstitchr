import { createApifyActorRunStatusUrl } from "@/lib/clipstitchr/server/apify/createApifyActorRunStatusUrl";
import { fetchApifyJson } from "@/lib/clipstitchr/server/apify/fetchApifyJson";
import { getApifyApiToken } from "@/lib/clipstitchr/server/apify/getApifyApiToken";
import { parseApifyActorRun } from "@/lib/clipstitchr/server/apify/parseApifyActorRun";

type GetApifyActorRunOptions = {
  fetcher?: typeof fetch;
  runId: string;
  timeoutMs?: number;
  token?: string;
};

export async function getApifyActorRun({
  fetcher,
  runId,
  timeoutMs,
  token = getApifyApiToken(),
}: GetApifyActorRunOptions) {
  const response = await fetchApifyJson(
    createApifyActorRunStatusUrl(runId, token),
    { method: "GET" },
    fetcher,
    timeoutMs,
  );

  return parseApifyActorRun(response);
}
