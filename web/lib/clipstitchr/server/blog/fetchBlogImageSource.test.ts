import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { blogImageMaxBytes } from "./blogImageCopyLimits";
import { fetchBlogImageSource } from "./fetchBlogImageSource";

describe("fetchBlogImageSource", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches supported images with a size cap", async () => {
    const body = new Uint8Array([1, 2, 3]).buffer;

    fetchMock.mockResolvedValue(
      new Response(body, {
        headers: {
          "content-length": "3",
          "content-type": "image/png",
        },
      }),
    );

    await expect(
      fetchBlogImageSource("https://blogger.test/image.png"),
    ).resolves.toEqual({
      body,
      contentType: "image/png",
    });
  });

  it("rejects non-http source URLs before fetching", async () => {
    await expect(fetchBlogImageSource("file:///tmp/image.png")).rejects.toThrow(
      "Blog image URLs must use http or https.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported content types", async () => {
    fetchMock.mockResolvedValue(
      new Response("not an image", {
        headers: {
          "content-type": "text/html",
        },
      }),
    );

    await expect(
      fetchBlogImageSource("https://blogger.test/image.png"),
    ).rejects.toThrow("Blog image URL did not return a supported image.");
  });

  it("rejects oversized images by declared content length", async () => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        headers: {
          "content-length": String(blogImageMaxBytes + 1),
          "content-type": "image/jpeg",
        },
      }),
    );

    await expect(
      fetchBlogImageSource("https://blogger.test/image.jpg"),
    ).rejects.toThrow("Blog image is larger than the 10 MB limit.");
  });

  it("stops reading an oversized image without a content-length header", async () => {
    const oversizedBody = new Uint8Array(blogImageMaxBytes + 1);

    fetchMock.mockResolvedValue(
      new Response(oversizedBody, {
        headers: {
          "content-type": "image/jpeg",
        },
      }),
    );

    await expect(
      fetchBlogImageSource("https://blogr.test/image.jpg"),
    ).rejects.toThrow("Blog image is larger than the 10 MB limit.");
  });
});
