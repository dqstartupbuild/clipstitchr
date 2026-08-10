import { createSocialPublishingUrl } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingUrl";
import { readSocialPublishingJsonResponse } from "@/lib/clipstitchr/server/socialPublishing/readSocialPublishingJsonResponse";
import { reserveSocialPublishingProviderRequest } from "@/lib/clipstitchr/server/socialPublishing/reserveSocialPublishingProviderRequest";
import { waitForSocialPublishingRetry } from "@/lib/clipstitchr/server/socialPublishing/waitForSocialPublishingRetry";

type RequestSocialPublishingOptions = {
  apiKey: string;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: URLSearchParams;
  requestId?: string;
};

export async function requestSocialPublishing<ResponseBody>(
  path: string,
  { apiKey, body, method = "GET", query, requestId }: RequestSocialPublishingOptions,
): Promise<ResponseBody> {
  const headers = new Headers({
    Authorization: `Bearer ${apiKey}`,
  });

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (requestId) {
    headers.set("x-request-id", requestId);
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await reserveSocialPublishingProviderRequest(apiKey);

    const response = await fetch(createSocialPublishingUrl(path, query), {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
      method,
    });

    if (response.status === 429 && attempt < 3) {
      await waitForSocialPublishingRetry(response, attempt);
      continue;
    }

    if (!response.ok) {
      const payload = await readSocialPublishingJsonResponse<{
        error?: unknown;
        message?: unknown;
      }>(response).catch(() => null);
      const providerMessage =
        typeof payload?.error === "string"
          ? payload.error.trim()
          : typeof payload?.message === "string"
            ? payload.message.trim()
            : "";

      throw new Error(
        providerMessage || `Zernio request failed with status ${response.status}.`,
      );
    }

    if (response.status === 204) {
      return undefined as ResponseBody;
    }

    return await readSocialPublishingJsonResponse<ResponseBody>(response);
  }

  throw new Error("Zernio request failed after retries.");
}
