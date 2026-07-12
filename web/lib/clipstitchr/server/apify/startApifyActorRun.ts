import { createApifyActorRunUrl } from "@/lib/clipstitchr/server/apify/createApifyActorRunUrl";
import { fetchApifyJson } from "@/lib/clipstitchr/server/apify/fetchApifyJson";
import { getApifyApiToken } from "@/lib/clipstitchr/server/apify/getApifyApiToken";
import { parseApifyActorRun } from "@/lib/clipstitchr/server/apify/parseApifyActorRun";

type StartApifyActorRunOptions = {
  actorId: string;
  fetcher?: typeof fetch;
  input: Record<string, unknown>;
  maxTotalChargeUsd: number;
  timeoutMs?: number;
  token?: string;
};

export async function startApifyActorRun({
  actorId,
  fetcher,
  input,
  maxTotalChargeUsd,
  timeoutMs,
  token = getApifyApiToken(),
}: StartApifyActorRunOptions) {
  const response = await fetchApifyJson(
    createApifyActorRunUrl(actorId, token, maxTotalChargeUsd),
    {
      body: JSON.stringify({ ...input, maxItems: 1 }),
      headers: { "content-type": "application/json" },
      method: "POST",
    },
    fetcher,
    timeoutMs,
  );

  return parseApifyActorRun(response);
}
