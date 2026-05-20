import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLazyBlobObjectUrl } from "@/lib/clipstitchr/hooks/useLazyBlobObjectUrl";

const mocks = vi.hoisted(() => ({
  effectCleanups: [] as Array<() => void>,
  stateSetter: vi.fn(),
  useObjectUrl: vi.fn(),
}));

vi.mock("react", () => ({
  useEffect: (effect: () => void | (() => void)) => {
    const cleanup = effect();

    if (cleanup) {
      mocks.effectCleanups.push(cleanup);
    }
  },
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.stateSetter,
  ],
}));

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

describe("useLazyBlobObjectUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.effectCleanups = [];
    mocks.useObjectUrl.mockReturnValue("blob:url");
  });

  it("uses the fallback blob immediately and syncs it asynchronously", async () => {
    const fallbackBlob = new Blob(["poster"], { type: "image/jpeg" });
    const url = useLazyBlobObjectUrl({
      cacheKey: "poster.jpg",
      fallbackBlob,
      loadBlob: vi.fn(),
    });

    await Promise.resolve();

    expect(url).toBe("blob:url");
    expect(mocks.useObjectUrl).toHaveBeenCalledWith(fallbackBlob);
    expect(mocks.stateSetter).toHaveBeenCalledWith({
      blob: fallbackBlob,
      cacheKey: "poster.jpg",
    });
    mocks.effectCleanups.forEach((cleanup) => cleanup());
  });

  it("loads a blob lazily when only a cache key is available", async () => {
    const loadedBlob = new Blob(["loaded"], { type: "image/jpeg" });

    useLazyBlobObjectUrl({
      cacheKey: "poster.jpg",
      loadBlob: vi.fn(async () => loadedBlob),
    });

    await Promise.resolve();

    expect(mocks.stateSetter).toHaveBeenCalledWith({
      blob: loadedBlob,
      cacheKey: "poster.jpg",
    });
    mocks.effectCleanups.forEach((cleanup) => cleanup());
  });

  it("clears the blob when no key is available or loading fails", async () => {
    useLazyBlobObjectUrl({
      loadBlob: vi.fn(),
    });
    useLazyBlobObjectUrl({
      cacheKey: "missing.jpg",
      loadBlob: vi.fn(async () => {
        throw new Error("missing");
      }),
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.stateSetter).toHaveBeenCalledWith({
      blob: null,
      cacheKey: undefined,
    });
    expect(mocks.stateSetter).toHaveBeenCalledWith({
      blob: null,
      cacheKey: "missing.jpg",
    });
    mocks.effectCleanups.forEach((cleanup) => cleanup());
  });
});
