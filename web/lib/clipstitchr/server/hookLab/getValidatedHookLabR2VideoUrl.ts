import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";

type GetValidatedHookLabR2VideoUrlOptions = {
  fetcher?: typeof fetch;
  maxBytes: number;
  object: R2ObjectReference;
  timeoutMs: number;
  userId: string;
};

export async function getValidatedHookLabR2VideoUrl({
  fetcher = fetch,
  maxBytes,
  object,
  timeoutMs,
  userId,
}: GetValidatedHookLabR2VideoUrlOptions) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new Error("The Hook Lab video byte limit is invalid.");
  }

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("The Hook Lab video timeout is invalid.");
  }

  assertR2ObjectKeyBelongsToUser(object.key, userId);

  const validationUrl = await getR2DownloadSignedUrl(object.key);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(validationUrl.url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Unable to download the saved video for Hook Lab.");
    }

    const contentLength = Number(response.headers.get("content-length"));

    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error("The saved video is too large for Hook Lab.");
    }

    const contentType =
      response.headers.get("content-type")?.split(";")[0]?.trim() ||
      object.contentType;

    if (!contentType?.toLowerCase().startsWith("video/")) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error("The saved Hook Lab source is not a video.");
    }

    if (!response.body) {
      throw new Error("The saved Hook Lab video was empty.");
    }

    const reader = response.body.getReader();
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error("The saved video is too large for Hook Lab.");
      }
    }

    if (totalBytes === 0) {
      throw new Error("The saved Hook Lab video was empty.");
    }

    return (await getR2DownloadSignedUrl(object.key)).url;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The saved video took too long to download for Hook Lab.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
