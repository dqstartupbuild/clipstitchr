import { assertHookLabRemoteMediaUrl } from "@/lib/clipstitchr/server/hookLab/assertHookLabRemoteMediaUrl";
import type { HookLabFetchedVideo } from "@/lib/clipstitchr/types/HookLabFetchedVideo";

type FetchHookLabRemoteVideoOptions = {
  fetcher?: typeof fetch;
  maxBytes?: number;
  maxRedirects?: number;
  resolveHostname?: (
    hostname: string,
  ) => Promise<readonly { address: string; family: number }[]>;
  timeoutMs?: number;
  url: string;
};

export async function fetchHookLabRemoteVideo({
  fetcher = fetch,
  maxBytes = 100 * 1024 * 1024,
  maxRedirects = 5,
  resolveHostname,
  timeoutMs = 30000,
  url,
}: FetchHookLabRemoteVideoOptions): Promise<HookLabFetchedVideo> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new Error("The imported video byte limit is invalid.");
  }

  if (!Number.isSafeInteger(maxRedirects) || maxRedirects < 0) {
    throw new Error("The imported video redirect limit is invalid.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let currentUrl = url;

  try {
    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
      const validatedUrl = await assertHookLabRemoteMediaUrl(
        currentUrl,
        resolveHostname,
      );
      const response = await fetcher(validatedUrl, {
        headers: { accept: "video/*" },
        redirect: "manual",
        signal: controller.signal,
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");

        await response.body?.cancel().catch(() => undefined);

        if (!location || redirectCount === maxRedirects) {
          throw new Error("The imported video redirected too many times.");
        }

        currentUrl = new URL(location, validatedUrl).toString();
        continue;
      }

      if (!response.ok) {
        throw new Error("The imported video could not be downloaded.");
      }

      const contentType = (response.headers.get("content-type") ?? "")
        .split(";", 1)[0]
        .trim()
        .toLowerCase();

      if (!contentType.startsWith("video/")) {
        throw new Error("The imported link did not return a video.");
      }

      const contentLength = Number(response.headers.get("content-length"));

      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        await response.body?.cancel().catch(() => undefined);
        throw new Error("The imported video is too large.");
      }

      if (!response.body) {
        throw new Error("The imported video response was empty.");
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        totalBytes += value.byteLength;

        if (totalBytes > maxBytes) {
          await reader.cancel().catch(() => undefined);
          throw new Error("The imported video is too large.");
        }

        chunks.push(value);
      }

      const bytes = new Uint8Array(totalBytes);
      let offset = 0;

      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }

      return {
        bytes,
        contentType,
        finalUrl: validatedUrl.toString(),
      };
    }

    throw new Error("The imported video redirected too many times.");
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The imported video took too long to download.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
