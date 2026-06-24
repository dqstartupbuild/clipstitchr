import { assertBlogImageByteLength } from "./assertBlogImageByteLength";
import { assertBlogImageContentLength } from "./assertBlogImageContentLength";
import { assertBlogImageContentType } from "./assertBlogImageContentType";
import { assertValidBlogImageSourceUrl } from "./assertValidBlogImageSourceUrl";
import { blogImageFetchTimeoutMs } from "./blogImageCopyLimits";

export type FetchedBlogImageSource = {
  body: ArrayBuffer;
  contentType: string;
};

export async function fetchBlogImageSource(
  sourceUrl: string,
): Promise<FetchedBlogImageSource> {
  const url = assertValidBlogImageSourceUrl(sourceUrl);
  const signal = AbortSignal.timeout(blogImageFetchTimeoutMs);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal,
    });

    if (!response.ok) {
      throw new Error("Unable to copy blog image.");
    }

    const contentType = assertBlogImageContentType(
      response.headers.get("content-type"),
    );

    assertBlogImageContentLength(response.headers.get("content-length"));

    const body = await response.arrayBuffer();

    assertBlogImageByteLength(body.byteLength);

    return {
      body,
      contentType,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new Error("Timed out copying blog image.");
    }

    throw error;
  }
}
