import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import type { ProviderHttpClient } from "./ProviderHttpClient.js";
import type { ProviderHttpRequest } from "./ProviderHttpRequest.js";
import type { ProviderHttpResponse } from "./ProviderHttpResponse.js";
import { readBoundedProviderResponseBody } from "./readBoundedProviderResponseBody.js";

const MAX_PROVIDER_RESPONSE_BYTES = 1_048_576;

export class FetchProviderHttpClient implements ProviderHttpClient {
  readonly #allowedOrigins: ReadonlySet<string>;
  readonly #fetch: typeof fetch;
  readonly #timeoutMilliseconds: number;

  constructor(
    allowedOrigins: readonly string[],
    timeoutMilliseconds = 15_000,
    fetchImplementation: typeof fetch = globalThis.fetch,
  ) {
    this.#allowedOrigins = new Set(
      allowedOrigins.map((origin) => new URL(origin).origin),
    );
    this.#timeoutMilliseconds = timeoutMilliseconds;
    this.#fetch = fetchImplementation;
  }

  async request(request: ProviderHttpRequest): Promise<ProviderHttpResponse> {
    const target = new URL(request.url);
    if (
      target.protocol !== "https:" ||
      target.username.length > 0 ||
      target.password.length > 0 ||
      !this.#allowedOrigins.has(target.origin)
    ) {
      throw new ProviderRuntimeError(
        request.provider,
        "invalid_configuration",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMilliseconds);

    try {
      const response = await this.#fetch(target, {
        method: request.method,
        ...(request.headers === undefined ? {} : { headers: request.headers }),
        ...(request.body === undefined ? {} : { body: request.body }),
        redirect: "error",
        signal: controller.signal,
      });
      const text = await readBoundedProviderResponseBody(
        request.provider,
        response,
        MAX_PROVIDER_RESPONSE_BYTES,
      );

      let body: unknown = null;
      if (text.length > 0) {
        try {
          body = JSON.parse(text) as unknown;
        } catch {
          throw new ProviderRuntimeError(request.provider, "invalid_response");
        }
      }

      return Object.freeze({
        status: response.status,
        headers: Object.freeze({
          "retry-after": response.headers.get("retry-after") ?? undefined,
          "x-fb-trace-id": response.headers.get("x-fb-trace-id") ?? undefined,
          "x-tt-logid": response.headers.get("x-tt-logid") ?? undefined,
        }),
        body,
      });
    } catch (error) {
      if (error instanceof ProviderRuntimeError) {
        throw error;
      }

      throw new ProviderRuntimeError(request.provider, "network", true);
    } finally {
      clearTimeout(timeout);
    }
  }
}
