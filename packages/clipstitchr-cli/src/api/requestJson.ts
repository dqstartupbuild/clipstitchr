import type { ApiClientOptions } from "./ApiClientOptions.js";
import { createApiUrl } from "./createApiUrl.js";
import { readApiErrorMessage } from "./readApiErrorMessage.js";

export async function requestJson<T>(
  options: ApiClientOptions,
  pathname: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);

  if (options.accessToken) {
    headers.set("authorization", `Bearer ${options.accessToken}`);
  }

  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(createApiUrl(options.apiBaseUrl, pathname), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }

  return (await response.json()) as T;
}
