import type { ProviderHttpClient } from "./ProviderHttpClient.js";
import type { ProviderHttpRequest } from "./ProviderHttpRequest.js";
import { executeProviderRequestWithResponse } from "./executeProviderRequestWithResponse.js";

export const executeProviderRequest = async (
  client: ProviderHttpClient,
  request: ProviderHttpRequest,
  successStatuses: ReadonlySet<number> = new Set([200]),
): Promise<unknown> => {
  const response = await executeProviderRequestWithResponse(
    client,
    request,
    successStatuses,
  );
  return response.body;
};
