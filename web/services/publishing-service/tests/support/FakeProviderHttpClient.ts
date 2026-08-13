import type { ProviderHttpClient } from "../../src/provider-runtime/http/ProviderHttpClient.js";
import type { ProviderHttpRequest } from "../../src/provider-runtime/http/ProviderHttpRequest.js";
import type { ProviderHttpResponse } from "../../src/provider-runtime/http/ProviderHttpResponse.js";

export class FakeProviderHttpClient implements ProviderHttpClient {
  readonly requests: ProviderHttpRequest[] = [];
  readonly #responses: Array<ProviderHttpResponse | Error>;

  constructor(responses: readonly (ProviderHttpResponse | Error)[]) {
    this.#responses = [...responses];
  }

  async request(request: ProviderHttpRequest): Promise<ProviderHttpResponse> {
    this.requests.push(request);
    const response = this.#responses.shift();
    if (response === undefined) {
      throw new Error("No fake provider response remains.");
    }
    if (response instanceof Error) {
      throw response;
    }
    return response;
  }
}
