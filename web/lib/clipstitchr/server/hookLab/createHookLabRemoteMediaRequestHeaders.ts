import { getApifyApiToken } from "@/lib/clipstitchr/server/apify/getApifyApiToken";

const apifyKeyValueStoreRecordPath =
  /^\/v2\/key-value-stores\/[^/]+\/records\/[^/]+$/;

export function createHookLabRemoteMediaRequestHeaders(
  url: URL,
  accept: string,
  apifyToken?: string,
) {
  const headers: Record<string, string> = { accept };

  if (
    url.protocol === "https:" &&
    url.hostname.toLowerCase() === "api.apify.com" &&
    apifyKeyValueStoreRecordPath.test(url.pathname)
  ) {
    const token = apifyToken?.trim() || getApifyApiToken();

    headers.authorization = `Bearer ${token}`;
  }

  return headers;
}
