import type { ProviderHttpResponse } from "../../src/provider-runtime/http/ProviderHttpResponse.js";

export const providerResponse = (
  body: unknown,
  status = 200,
  headers: Readonly<Record<string, string | undefined>> = {},
): ProviderHttpResponse => Object.freeze({ status, headers, body });
