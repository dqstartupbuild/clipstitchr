import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadCachedR2ImageBlobs } from "@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

const mocks = vi.hoisted(() => ({
  createR2DownloadUrls: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/r2/createR2DownloadUrls", () => ({
  createR2DownloadUrls: mocks.createR2DownloadUrls,
}));

function createObject(key: string): R2ObjectReference {
  return {
    contentType: "image/jpeg",
    key,
    size: 12,
  };
}

function stubImageCache(matchResponse?: Response) {
  const cache = {
    match: vi.fn(async () => matchResponse),
    put: vi.fn(async () => undefined),
  };

  vi.stubGlobal("window", {
    caches: {
      open: vi.fn(async () => cache),
    },
    location: {
      origin: "https://clipstitchr.test",
    },
  });

  return cache;
}

describe("downloadCachedR2ImageBlobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mocks.createR2DownloadUrls.mockImplementation(async (keys: string[]) =>
      keys.map((key) => ({
        expiresIn: 300,
        key,
        url: `https://r2.example/${encodeURIComponent(key)}`,
      })),
    );
  });

  it("returns persistent cache hits without creating signed URLs", async () => {
    const cache = stubImageCache(
      new Response(new Blob(["cached"], { type: "image/jpeg" })),
    );
    const object = createObject("users/user_123/video-clips/clip_1/poster.jpg");

    const blobsByKey = await downloadCachedR2ImageBlobs([object]);

    expect(blobsByKey.get(object.key)).toBeInstanceOf(Blob);
    expect(mocks.createR2DownloadUrls).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("batch-signs cache misses and stores fetched blobs", async () => {
    const cache = stubImageCache();
    const fetchMock = vi.fn(async () =>
      new Response(new Blob(["network"], { type: "image/jpeg" })),
    );
    const firstObject = createObject(
      "users/user_123/video-clips/clip_1/poster.jpg",
    );
    const secondObject = createObject(
      "users/user_123/stitches/stitch_1/poster.jpg",
    );

    vi.stubGlobal("fetch", fetchMock);

    const blobsByKey = await downloadCachedR2ImageBlobs([
      firstObject,
      secondObject,
    ]);

    expect(mocks.createR2DownloadUrls).toHaveBeenCalledWith([
      firstObject.key,
      secondObject.key,
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(cache.put).toHaveBeenCalledTimes(2);
    expect(blobsByKey.get(firstObject.key)).toBeInstanceOf(Blob);
    expect(blobsByKey.get(secondObject.key)).toBeInstanceOf(Blob);
  });
});
