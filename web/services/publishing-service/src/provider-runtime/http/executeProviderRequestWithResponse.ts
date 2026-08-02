import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import type { ProviderHttpClient } from "./ProviderHttpClient.js";
import type { ProviderHttpRequest } from "./ProviderHttpRequest.js";
import type { ProviderHttpResponse } from "./ProviderHttpResponse.js";
import { parseRetryAfterSeconds } from "./parseRetryAfterSeconds.js";

export const executeProviderRequestWithResponse = async (
  client: ProviderHttpClient,
  request: ProviderHttpRequest,
  successStatuses: ReadonlySet<number> = new Set([200]),
): Promise<ProviderHttpResponse> => {
  const response = await client.request(request);
  if (successStatuses.has(response.status)) {
    return response;
  }
  if (response.status === 401 || response.status === 403) {
    throw new ProviderRuntimeError(request.provider, "auth_required");
  }
  if (response.status === 429) {
    throw new ProviderRuntimeError(
      request.provider,
      "rate_limited",
      true,
      parseRetryAfterSeconds(response.headers["retry-after"]),
    );
  }
  if (response.status >= 500) {
    throw new ProviderRuntimeError(request.provider, "transient_failure", true);
  }
  throw new ProviderRuntimeError(request.provider, "rejected");
};
