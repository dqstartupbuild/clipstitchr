import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import { parseRetryAfterSeconds } from "../http/parseRetryAfterSeconds.js";
import { readBoundedProviderResponseBody } from "../http/readBoundedProviderResponseBody.js";
import type { YouTubeUploadProgress } from "./YouTubeUploadProgress.js";
import type { YouTubeUploadTransport } from "./YouTubeUploadTransport.js";
import { validateYouTubeResumableSessionUri } from "./validateYouTubeResumableSessionUri.js";

const MAXIMUM_RESPONSE_BYTES = 1_048_576;

export class FetchYouTubeUploadTransport implements YouTubeUploadTransport {
  readonly #fetch: typeof fetch;
  readonly #mediaOrigin: string;
  readonly #timeoutMilliseconds: number;

  constructor(
    mediaOrigin: string,
    fetchImplementation: typeof fetch = globalThis.fetch,
    timeoutMilliseconds = 120_000,
  ) {
    try {
      const parsed = new URL(mediaOrigin);
      if (
        parsed.protocol !== "https:" ||
        parsed.username.length > 0 ||
        parsed.password.length > 0 ||
        parsed.pathname !== "/" ||
        parsed.search.length > 0 ||
        parsed.hash.length > 0
      ) {
        throw new TypeError("Invalid media origin");
      }
      this.#mediaOrigin = parsed.origin;
    } catch {
      throw new ProviderRuntimeError("youtube", "invalid_configuration");
    }
    if (
      !Number.isSafeInteger(timeoutMilliseconds) ||
      timeoutMilliseconds < 1_000 ||
      timeoutMilliseconds > 900_000
    ) {
      throw new ProviderRuntimeError("youtube", "invalid_configuration");
    }
    this.#fetch = fetchImplementation;
    this.#timeoutMilliseconds = timeoutMilliseconds;
  }

  async initiate(input: Parameters<YouTubeUploadTransport["initiate"]>[0]): Promise<string> {
    this.#assertAccessAndSize(input.accessToken, input.totalBytes);
    const response = await this.#request(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=id%2Csnippet%2Cstatus&notifySubscribers=true",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Length": String(input.totalBytes),
          "X-Upload-Content-Type": input.contentType,
        },
        body: JSON.stringify({
          snippet: {
            title: input.metadata.title,
            description: input.metadata.description,
            tags: input.metadata.tags,
          },
          status: {
            privacyStatus: input.metadata.visibility,
            selfDeclaredMadeForKids: input.metadata.madeForKids,
          },
        }),
      },
    );
    if (response.status !== 200 && response.status !== 201) {
      return this.#throwResponse(response);
    }
    const location = response.headers.get("location");
    if (location === null) {
      throw new ProviderRuntimeError("youtube", "invalid_response");
    }
    await readBoundedProviderResponseBody(
      "youtube",
      response,
      MAXIMUM_RESPONSE_BYTES,
    );
    return validateYouTubeResumableSessionUri(location);
  }

  async probe(input: Parameters<YouTubeUploadTransport["probe"]>[0]): Promise<YouTubeUploadProgress> {
    this.#assertAccessAndSize(input.accessToken, input.totalBytes);
    const response = await this.#request(
      validateYouTubeResumableSessionUri(input.sessionUri),
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          "Content-Length": "0",
          "Content-Range": `bytes */${input.totalBytes}`,
        },
      },
    );
    return this.#readProgress(response, input.totalBytes);
  }

  async uploadRange(
    input: Parameters<YouTubeUploadTransport["uploadRange"]>[0],
  ): Promise<YouTubeUploadProgress> {
    this.#assertAccessAndSize(input.accessToken, input.totalBytes);
    if (
      !Number.isSafeInteger(input.startOffset) ||
      !Number.isSafeInteger(input.endOffsetInclusive) ||
      input.startOffset < 0 ||
      input.endOffsetInclusive < input.startOffset ||
      input.endOffsetInclusive >= input.totalBytes
    ) {
      throw new ProviderRuntimeError("youtube", "invalid_request");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMilliseconds);
    try {
      const source = await this.#fetch(this.#readMediaUrl(input.mediaUrl), {
        method: "GET",
        headers: {
          Range: `bytes=${input.startOffset}-${input.endOffsetInclusive}`,
        },
        redirect: "error",
        signal: controller.signal,
      });
      const contentLength = input.endOffsetInclusive - input.startOffset + 1;
      if (
        source.status !== 206 ||
        source.body === null ||
        source.headers.get("content-length") !== String(contentLength) ||
        source.headers.get("content-range") !==
          `bytes ${input.startOffset}-${input.endOffsetInclusive}/${input.totalBytes}`
      ) {
        throw new ProviderRuntimeError("youtube", "invalid_response");
      }
      const request = {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          "Content-Length": String(contentLength),
          "Content-Range": `bytes ${input.startOffset}-${input.endOffsetInclusive}/${input.totalBytes}`,
          "Content-Type": input.contentType,
        },
        body: source.body,
        duplex: "half" as const,
        redirect: "error" as const,
        signal: controller.signal,
      } satisfies RequestInit & { duplex: "half" };
      const response = await this.#fetch(
        validateYouTubeResumableSessionUri(input.sessionUri),
        request,
      );
      return await this.#readProgress(response, input.totalBytes);
    } catch (error) {
      if (error instanceof ProviderRuntimeError) {
        throw error;
      }
      throw new ProviderRuntimeError("youtube", "network", true);
    } finally {
      clearTimeout(timeout);
    }
  }

  async uploadThumbnail(
    input: Parameters<YouTubeUploadTransport["uploadThumbnail"]>[0],
  ): Promise<void> {
    this.#assertAccessAndSize(input.accessToken, input.byteLength);
    if (!/^[A-Za-z0-9_-]{1,128}$/u.test(input.videoId)) {
      throw new ProviderRuntimeError("youtube", "invalid_request");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMilliseconds);
    try {
      const source = await this.#fetch(this.#readMediaUrl(input.mediaUrl), {
        method: "GET",
        headers: { Range: `bytes=0-${input.byteLength - 1}` },
        redirect: "error",
        signal: controller.signal,
      });
      if (
        source.status !== 206 ||
        source.body === null ||
        source.headers.get("content-length") !== String(input.byteLength) ||
        source.headers.get("content-range") !==
          `bytes 0-${input.byteLength - 1}/${input.byteLength}`
      ) {
        throw new ProviderRuntimeError("youtube", "invalid_response");
      }
      const target = new URL(
        "https://youtube.googleapis.com/upload/youtube/v3/thumbnails/set",
      );
      target.search = new URLSearchParams({
        videoId: input.videoId,
        uploadType: "media",
      }).toString();
      const response = await this.#fetch(target, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          "Content-Length": String(input.byteLength),
          "Content-Type": input.contentType,
        },
        body: source.body,
        duplex: "half",
        redirect: "error",
        signal: controller.signal,
      } as RequestInit & { duplex: "half" });
      if (response.status !== 200) {
        await this.#throwResponse(response);
      }
      await readBoundedProviderResponseBody(
        "youtube",
        response,
        MAXIMUM_RESPONSE_BYTES,
      );
    } catch (error) {
      if (error instanceof ProviderRuntimeError) {
        throw error;
      }
      throw new ProviderRuntimeError("youtube", "network", true);
    } finally {
      clearTimeout(timeout);
    }
  }

  #assertAccessAndSize(accessToken: string, totalBytes: number): void {
    if (
      accessToken.length < 1 ||
      !Number.isSafeInteger(totalBytes) ||
      totalBytes < 1
    ) {
      throw new ProviderRuntimeError("youtube", "invalid_request");
    }
  }

  #readMediaUrl(value: string): string {
    try {
      const url = new URL(value);
      if (
        url.protocol !== "https:" ||
        url.origin !== this.#mediaOrigin ||
        url.username.length > 0 ||
        url.password.length > 0 ||
        !url.pathname.startsWith("/api/studio/publishing/media/") ||
        url.pathname.length <= "/api/studio/publishing/media/".length ||
        url.search.length > 0 ||
        url.hash.length > 0
      ) {
        throw new TypeError("Invalid media URL");
      }
      return url.toString();
    } catch {
      throw new ProviderRuntimeError("youtube", "invalid_request");
    }
  }

  async #readProgress(
    response: Response,
    totalBytes: number,
  ): Promise<YouTubeUploadProgress> {
    if (response.status === 404 || response.status === 410) {
      await readBoundedProviderResponseBody(
        "youtube",
        response,
        MAXIMUM_RESPONSE_BYTES,
      );
      return Object.freeze({ kind: "expired" });
    }
    if (response.status === 308) {
      await readBoundedProviderResponseBody(
        "youtube",
        response,
        MAXIMUM_RESPONSE_BYTES,
      );
      const range = response.headers.get("range");
      if (range === null) {
        return Object.freeze({ kind: "active", committedOffset: 0 });
      }
      const match = /^bytes=0-(\d+)$/u.exec(range);
      const lastByte = match === null ? Number.NaN : Number(match[1]);
      if (
        !Number.isSafeInteger(lastByte) ||
        lastByte < 0 ||
        lastByte >= totalBytes
      ) {
        throw new ProviderRuntimeError("youtube", "invalid_response");
      }
      return Object.freeze({
        kind: "active",
        committedOffset: lastByte + 1,
      });
    }
    if (response.status !== 200 && response.status !== 201) {
      return this.#throwResponse(response);
    }
    const text = await readBoundedProviderResponseBody(
      "youtube",
      response,
      MAXIMUM_RESPONSE_BYTES,
    );
    try {
      const parsed = JSON.parse(text) as unknown;
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed) ||
        typeof (parsed as Record<string, unknown>)["id"] !== "string" ||
        !/^[A-Za-z0-9_-]{1,128}$/u.test(
          (parsed as Record<string, unknown>)["id"] as string,
        )
      ) {
        throw new TypeError("Invalid upload response");
      }
      return Object.freeze({
        kind: "complete",
        videoId: (parsed as Record<string, string>)["id"]!,
      });
    } catch {
      throw new ProviderRuntimeError("youtube", "invalid_response");
    }
  }

  async #request(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMilliseconds);
    try {
      return await this.#fetch(url, {
        ...init,
        redirect: "error",
        signal: controller.signal,
      });
    } catch {
      throw new ProviderRuntimeError("youtube", "network", true);
    } finally {
      clearTimeout(timeout);
    }
  }

  async #throwResponse(response: Response): Promise<never> {
    await readBoundedProviderResponseBody(
      "youtube",
      response,
      MAXIMUM_RESPONSE_BYTES,
    );
    if (response.status === 401 || response.status === 403) {
      throw new ProviderRuntimeError("youtube", "auth_required");
    }
    if (response.status === 429) {
      throw new ProviderRuntimeError(
        "youtube",
        "rate_limited",
        true,
        parseRetryAfterSeconds(response.headers.get("retry-after") ?? undefined),
      );
    }
    if (response.status >= 500) {
      throw new ProviderRuntimeError("youtube", "transient_failure", true);
    }
    throw new ProviderRuntimeError("youtube", "rejected");
  }
}
