import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HookLabIdeaThumbnail } from "@/app/_components/hooks/HookLabIdeaThumbnail";

const mocks = vi.hoisted(() => ({
  downloadCachedR2ImageBlobs: vi.fn(),
  lazyOptions: null as null | {
    cacheKey?: string;
    loadBlob: () => Promise<Blob | null | undefined>;
  },
}));

vi.mock(
  "@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs",
  () => ({
    downloadCachedR2ImageBlobs: mocks.downloadCachedR2ImageBlobs,
  }),
);

vi.mock("@/lib/clipstitchr/hooks/useLazyBlobObjectUrl", () => ({
  useLazyBlobObjectUrl: (options: typeof mocks.lazyOptions) => {
    mocks.lazyOptions = options;
    return "blob:hook-lab-thumbnail";
  },
}));

describe("HookLabIdeaThumbnail", () => {
  beforeEach(() => {
    mocks.downloadCachedR2ImageBlobs.mockReset();
    mocks.lazyOptions = null;
  });

  it("loads the thumbnail through the authenticated R2 image cache", async () => {
    const thumbnailBlob = new Blob(["preview"], { type: "image/jpeg" });
    const thumbnailObject = {
      contentType: "image/jpeg",
      key: "hook-lab/idea_1/thumbnail.jpg",
      size: 2048,
    };
    mocks.downloadCachedR2ImageBlobs.mockResolvedValue(
      new Map([[thumbnailObject.key, thumbnailBlob]]),
    );

    const markup = renderToStaticMarkup(
      <HookLabIdeaThumbnail
        ideaName="The honest before-and-after"
        sourceLabel="Social link"
        thumbnailObject={thumbnailObject}
      />,
    );

    expect(markup).toContain('src="blob:hook-lab-thumbnail"');
    expect(markup).toContain(
      'alt="Social link preview for The honest before-and-after"',
    );

    const lazyOptions = mocks.lazyOptions;

    if (!lazyOptions) {
      throw new Error("Expected lazy thumbnail loading options.");
    }

    expect(lazyOptions.cacheKey).toBe(thumbnailObject.key);
    await expect(lazyOptions.loadBlob()).resolves.toBe(thumbnailBlob);
    expect(mocks.downloadCachedR2ImageBlobs).toHaveBeenCalledWith([
      thumbnailObject,
    ]);
  });
});
