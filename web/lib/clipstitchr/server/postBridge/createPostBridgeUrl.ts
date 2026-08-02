import { postBridgeApiBaseUrl } from "@/lib/clipstitchr/server/postBridge/postBridgeApiBaseUrl";

export function createPostBridgeUrl(path: string, query?: URLSearchParams) {
  const url = new URL(path, postBridgeApiBaseUrl);

  query?.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url;
}
