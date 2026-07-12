import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";

type CreateHookLabFileFromR2ObjectOptions = {
  fallbackFileName: string;
  fetcher?: typeof fetch;
  maxBytes: number;
  object: R2ObjectReference;
  timeoutMs: number;
  userId: string;
};

export async function createHookLabFileFromR2Object({
  fallbackFileName,
  fetcher = fetch,
  maxBytes,
  object,
  timeoutMs,
  userId,
}: CreateHookLabFileFromR2ObjectOptions) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new Error("The Hook Lab video byte limit is invalid.");
  }

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("The Hook Lab video timeout is invalid.");
  }

  assertR2ObjectKeyBelongsToUser(object.key, userId);

  const { url } = await getR2DownloadSignedUrl(object.key);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error("Unable to download the saved video for Hook Lab.");
    }

    const contentLength = Number(response.headers.get("content-length"));

    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error("The saved video is too large for Hook Lab.");
    }

    if (!response.body) {
      throw new Error("The saved Hook Lab video was empty.");
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
        throw new Error("The saved video is too large for Hook Lab.");
      }

      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const type =
      response.headers.get("content-type")?.split(";")[0]?.trim() ||
      object.contentType;

    if (!type?.toLowerCase().startsWith("video/")) {
      throw new Error("The saved Hook Lab source is not a video.");
    }

    return new File(
      [bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)],
      fallbackFileName,
      { type },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The saved video took too long to download for Hook Lab.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
