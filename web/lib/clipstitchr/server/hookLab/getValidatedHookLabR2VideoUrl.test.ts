import { beforeEach, describe, expect, it, vi } from "vitest";
import { getValidatedHookLabR2VideoUrl } from "@/lib/clipstitchr/server/hookLab/getValidatedHookLabR2VideoUrl";

const mocks = vi.hoisted(() => ({
  getR2DownloadSignedUrl: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

const object = {
  contentType: "video/mp4",
  key: "users/owner_1/video-clips/clip_1/video.mp4",
  size: 1,
};

describe("getValidatedHookLabR2VideoUrl", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns a fresh signed URL after streaming the complete saved object", async () => {
    mocks.getR2DownloadSignedUrl
      .mockResolvedValueOnce({
        expiresIn: 900,
        url: "https://r2.example/validation/video.mp4",
      })
      .mockResolvedValueOnce({
        expiresIn: 900,
        url: "https://r2.example/fresh/video.mp4",
      });
    const fetcher = vi.fn(async () =>
      Promise.resolve(
        new Response(new Uint8Array([1, 2, 3]), {
          headers: { "content-type": "video/mp4" },
          status: 200,
        }),
      ),
    ) as unknown as typeof fetch;

    await expect(
      getValidatedHookLabR2VideoUrl({
        fetcher,
        maxBytes: 10,
        object,
        timeoutMs: 1_000,
        userId: "owner_1",
      }),
    ).resolves.toBe("https://r2.example/fresh/video.mp4");
    expect(mocks.getR2DownloadSignedUrl).toHaveBeenCalledTimes(2);
  });

  it("streams the saved object and enforces the actual downloaded byte count", async () => {
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 900,
      url: "https://r2.example/video.mp4",
    });
    const fetcher = vi.fn(async () =>
      Promise.resolve(
        new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(new Uint8Array([1, 2]));
              controller.enqueue(new Uint8Array([3, 4]));
              controller.close();
            },
          }),
          { headers: { "content-type": "video/mp4" }, status: 200 },
        ),
      ),
    ) as unknown as typeof fetch;

    await expect(
      getValidatedHookLabR2VideoUrl({
        fetcher,
        maxBytes: 3,
        object,
        timeoutMs: 1_000,
        userId: "owner_1",
      }),
    ).rejects.toThrow("too large for Hook Lab");
  });

  it("rejects an oversized content length before reading the response", async () => {
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 900,
      url: "https://r2.example/video.mp4",
    });
    const fetcher = vi.fn(async () =>
      Promise.resolve(
        new Response(new Uint8Array([1]), {
          headers: { "content-length": "20", "content-type": "video/mp4" },
          status: 200,
        }),
      ),
    ) as unknown as typeof fetch;

    await expect(
      getValidatedHookLabR2VideoUrl({
        fetcher,
        maxBytes: 10,
        object,
        timeoutMs: 1_000,
        userId: "owner_1",
      }),
    ).rejects.toThrow("too large for Hook Lab");
  });

  it("aborts a saved-object download that exceeds its timeout", async () => {
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 900,
      url: "https://r2.example/video.mp4",
    });
    const fetcher = vi.fn(
      async (_url: URL | RequestInfo, init?: RequestInit) =>
        await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error("aborted");

            error.name = "AbortError";
            reject(error);
          });
        }),
    ) as unknown as typeof fetch;

    await expect(
      getValidatedHookLabR2VideoUrl({
        fetcher,
        maxBytes: 10,
        object,
        timeoutMs: 1,
        userId: "owner_1",
      }),
    ).rejects.toThrow("took too long");
  });

  it("rejects a saved object whose response is not video", async () => {
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 900,
      url: "https://r2.example/video.mp4",
    });
    const fetcher = vi.fn(async () =>
      Promise.resolve(
        new Response(new Uint8Array([1, 2, 3]), {
          headers: { "content-type": "text/html" },
          status: 200,
        }),
      ),
    ) as unknown as typeof fetch;

    await expect(
      getValidatedHookLabR2VideoUrl({
        fetcher,
        maxBytes: 10,
        object,
        timeoutMs: 1_000,
        userId: "owner_1",
      }),
    ).rejects.toThrow("is not a video");
  });

  it("rejects a present saved-video stream that contains no bytes", async () => {
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 900,
      url: "https://r2.example/video.mp4",
    });
    const fetcher = vi.fn(async () =>
      Promise.resolve(
        new Response(new Uint8Array(), {
          headers: { "content-type": "video/mp4" },
          status: 200,
        }),
      ),
    ) as unknown as typeof fetch;

    await expect(
      getValidatedHookLabR2VideoUrl({
        fetcher,
        maxBytes: 10,
        object,
        timeoutMs: 1_000,
        userId: "owner_1",
      }),
    ).rejects.toThrow("saved Hook Lab video was empty");
    expect(mocks.getR2DownloadSignedUrl).toHaveBeenCalledTimes(1);
  });
});
