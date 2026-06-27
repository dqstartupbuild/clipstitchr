import { createPostBridgeUrl } from "@/lib/clipstitchr/server/postBridge/createPostBridgeUrl";
import { waitForPostBridgeRetry } from "@/lib/clipstitchr/server/postBridge/waitForPostBridgeRetry";

type RequestPostBridgeOptions = {
  apiKey: string;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: URLSearchParams;
};

export async function requestPostBridge<ResponseBody>(
  path: string,
  { apiKey, body, method = "GET", query }: RequestPostBridgeOptions,
): Promise<ResponseBody> {
  const headers = new Headers({
    Authorization: `Bearer ${apiKey}`,
  });

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(createPostBridgeUrl(path, query), {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
      method,
    });

    if (response.status === 429 && attempt < 3) {
      await waitForPostBridgeRetry(response, attempt);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Post Bridge request failed with status ${response.status}.`);
    }

    if (response.status === 204) {
      return undefined as ResponseBody;
    }

    return (await response.json()) as ResponseBody;
  }

  throw new Error("Post Bridge request failed after retries.");
}
