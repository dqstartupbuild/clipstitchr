import type { ProviderHttpRequest } from "./ProviderHttpRequest.js";
import type { ProviderHttpResponse } from "./ProviderHttpResponse.js";

export interface ProviderHttpClient {
  request(request: ProviderHttpRequest): Promise<ProviderHttpResponse>;
}
