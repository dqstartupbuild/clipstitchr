import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSwiprLibraryState } from "@/lib/clipstitchr/hooks/useSwiprLibraryState";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

const mocks = vi.hoisted(() => {
  const mutationFns = new Map<string, ReturnType<typeof vi.fn>>();

  return {
    analyzeSwiprBackground: vi.fn(),
    convexQuery: vi.fn(),
    createId: vi.fn(),
    createSwiprBackgroundAssetFromConvexDocument: vi.fn(),
    createSwiprSwipeFromConvexDocument: vi.fn(),
    deleteObjectsFromR2: vi.fn(),
    downloadCachedR2ImageBlobs: vi.fn(),
    downloadSwiprBackgroundBlobFromR2: vi.fn(),
    getImageDimensions: vi.fn(),
    mutationFns,
    renderSwiprSlideBlob: vi.fn(),
    uploadBlobsToR2: vi.fn(),
    uploadSwiprBackgroundBlobToR2: vi.fn(),
    useConvex: vi.fn(),
    useConvexAuth: vi.fn(),
    useEffect: vi.fn(),
    useMutation: vi.fn((mutationId: string) => {
      const mutation = mutationFns.get(mutationId) ?? vi.fn();

      mutationFns.set(mutationId, mutation);
      return mutation;
    }),
    usePathname: vi.fn(),
    useQuery: vi.fn(),
    useStateSetter: vi.fn(),
  };
});

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useEffect: mocks.useEffect,
  useMemo: (factory: () => unknown) => factory(),
  useRef: (value: unknown) => ({ current: value }),
  useState: (initialValue: unknown) => {
    const value =
      typeof initialValue === "function"
        ? (initialValue as () => unknown)()
        : initialValue;

    return [
      value,
      (nextValue: unknown) => {
        mocks.useStateSetter(nextValue);

        if (typeof nextValue === "function") {
          return (nextValue as (currentValue: unknown) => unknown)(value);
        }

        return nextValue;
      },
    ];
  },
}));

vi.mock("convex/react", () => ({
  useConvex: mocks.useConvex,
  useConvexAuth: mocks.useConvexAuth,
  useMutation: mocks.useMutation,
  useQuery: mocks.useQuery,
}));

vi.mock("next/navigation", () => ({
  usePathname: mocks.usePathname,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    swipes: {
      list: "swipes.list",
      remove: "swipes.remove",
      save: "swipes.save",
      updatePostedStatus: "swipes.updatePostedStatus",
    },
    swiprBackgrounds: {
      get: "swiprBackgrounds.get",
      list: "swiprBackgrounds.list",
      save: "swiprBackgrounds.save",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/backend/createSwiprBackgroundAssetFromConvexDocument",
  () => ({
    createSwiprBackgroundAssetFromConvexDocument:
      mocks.createSwiprBackgroundAssetFromConvexDocument,
  }),
);

vi.mock(
  "@/lib/clipstitchr/backend/createSwiprSwipeFromConvexDocument",
  () => ({
    createSwiprSwipeFromConvexDocument:
      mocks.createSwiprSwipeFromConvexDocument,
  }),
);

vi.mock("@/lib/clipstitchr/client/analyzeSwiprBackground", () => ({
  analyzeSwiprBackground: mocks.analyzeSwiprBackground,
}));

vi.mock(
  "@/lib/clipstitchr/client/r2/downloadSwiprBackgroundBlobFromR2",
  () => ({
    downloadSwiprBackgroundBlobFromR2:
      mocks.downloadSwiprBackgroundBlobFromR2,
  }),
);

vi.mock("@/lib/clipstitchr/client/r2/deleteObjectsFromR2", () => ({
  deleteObjectsFromR2: mocks.deleteObjectsFromR2,
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs", () => ({
  downloadCachedR2ImageBlobs: mocks.downloadCachedR2ImageBlobs,
}));

vi.mock("@/lib/clipstitchr/client/r2/uploadBlobsToR2", () => ({
  uploadBlobsToR2: mocks.uploadBlobsToR2,
}));

vi.mock(
  "@/lib/clipstitchr/client/r2/uploadSwiprBackgroundBlobToR2",
  () => ({
    uploadSwiprBackgroundBlobToR2: mocks.uploadSwiprBackgroundBlobToR2,
  }),
);

vi.mock("@/lib/clipstitchr/media/getImageDimensions", () => ({
  getImageDimensions: mocks.getImageDimensions,
}));

vi.mock("@/lib/clipstitchr/media/renderSwiprSlideBlob", () => ({
  renderSwiprSlideBlob: mocks.renderSwiprSlideBlob,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function getMutation(id: string) {
  const mutation = mocks.mutationFns.get(id);

  if (!mutation) {
    throw new Error(`Missing mocked mutation ${id}.`);
  }

  return mutation;
}

function createBackgroundDocument(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    description: "Background description",
    details: "Background details",
    height: 1920,
    id: "background_1",
    imageObject: {
      contentType: "image/jpeg",
      key: "users/user_123/swipr/background_1.jpg",
      size: 100,
    },
    mimeType: "image/jpeg",
    name: "Background",
    size: 100,
    source: "upload",
    tags: ["swipr"],
    width: 1080,
    ...overrides,
  };
}

function createSwipeDocument(overrides: Record<string, unknown> = {}) {
  return {
    backgroundId: "background_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "swipe_1",
    name: "Swipe",
    productContext: "Context",
    productName: "Product",
    productSourceId: "product_1",
    productSourceType: "saved-product",
    slides: [],
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("useSwiprLibraryState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutationFns.clear();
    mocks.createId.mockReturnValue("background_new");
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mocks.useConvex.mockReturnValue({
      query: mocks.convexQuery,
    });
    mocks.convexQuery.mockResolvedValue(
      createBackgroundDocument({ id: "background_2" }),
    );
    mocks.usePathname.mockReturnValue("/dashboard/uploads");
    mocks.useQuery.mockImplementation((queryId: string, args) => {
      if (queryId === "swiprBackgrounds.list") {
        return [createBackgroundDocument()];
      }

      if (queryId === "swipes.list") {
        if (args?.postedStatus === "posted") {
          return [];
        }

        return [createSwipeDocument()];
      }

      return undefined;
    });
    mocks.createSwiprBackgroundAssetFromConvexDocument.mockReturnValue({
      id: "background_1",
      name: "Mapped background",
    });
    mocks.createSwiprSwipeFromConvexDocument.mockReturnValue({
      id: "swipe_1",
      name: "Mapped swipe",
    });
    mocks.analyzeSwiprBackground.mockResolvedValue({
      description: "Analyzed description",
      details: "Analyzed details",
      name: "Analyzed background",
      tags: ["ai"],
    });
    mocks.downloadSwiprBackgroundBlobFromR2.mockResolvedValue(
      new Blob(["background"], { type: "image/jpeg" }),
    );
    mocks.deleteObjectsFromR2.mockResolvedValue(undefined);
    mocks.downloadCachedR2ImageBlobs.mockImplementation(async (objects) => {
      return new Map(
        objects.map((object: { key: string }) => [
          object.key,
          new Blob(["poster"], { type: "image/png" }),
        ]),
      );
    });
    mocks.getImageDimensions.mockResolvedValue({ height: 1920, width: 1080 });
    mocks.renderSwiprSlideBlob.mockResolvedValue(
      new Blob(["poster"], { type: "image/png" }),
    );
    mocks.uploadBlobsToR2.mockResolvedValue([
      {
        contentType: "image/png",
        key: "users/user_123/swipes/swipe_new/poster.png",
        size: 12,
      },
    ]);
    mocks.uploadSwiprBackgroundBlobToR2.mockResolvedValue({
      contentType: "image/jpeg",
      key: "users/user_123/swipr/background_new.jpg",
      size: 123,
    });
  });

  it("maps authenticated swipe documents and queries owned libraries", () => {
    const state = useSwiprLibraryState();

    expect(state.swipes).toEqual([{ id: "swipe_1", name: "Mapped swipe" }]);
    expect(state.postedSwipes).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith("swiprBackgrounds.list", {});
    expect(mocks.useQuery).toHaveBeenCalledWith("swipes.list", {
      postedStatus: "active",
    });
    expect(mocks.useQuery).toHaveBeenCalledWith("swipes.list", {
      postedStatus: "posted",
    });
  });

  it("skips library queries while signed out", () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const state = useSwiprLibraryState();

    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith(
      "swiprBackgrounds.list",
      "skip",
    );
    expect(mocks.useQuery).toHaveBeenCalledWith("swipes.list", "skip");
  });

  it("loads and caches a background blob from R2", async () => {
    const state = useSwiprLibraryState();

    await expect(state.loadBackgroundBlob("background_1")).resolves.toEqual(
      expect.any(Blob),
    );
    await expect(state.loadBackgroundBlob("background_1")).resolves.toEqual(
      expect.any(Blob),
    );

    expect(mocks.downloadSwiprBackgroundBlobFromR2).toHaveBeenCalledTimes(1);
    expect(mocks.downloadSwiprBackgroundBlobFromR2).toHaveBeenCalledWith(
      "background_1",
    );
  });

  it("loads a missing background asset and blob by id", async () => {
    const blob = new Blob(["background 2"], { type: "image/jpeg" });

    mocks.downloadSwiprBackgroundBlobFromR2.mockResolvedValueOnce(blob);
    mocks.convexQuery.mockResolvedValueOnce(
      createBackgroundDocument({ id: "background_2" }),
    );
    mocks.createSwiprBackgroundAssetFromConvexDocument.mockImplementationOnce(
      (background, loadedBlob) => ({
        blob: loadedBlob,
        id: background.id,
        name: "Mapped background 2",
      }),
    );

    const state = useSwiprLibraryState();

    await expect(state.loadBackgroundAsset("background_2")).resolves.toEqual({
      blob,
      id: "background_2",
      name: "Mapped background 2",
    });

    expect(mocks.convexQuery).toHaveBeenCalledWith("swiprBackgrounds.get", {
      id: "background_2",
    });
    expect(mocks.downloadSwiprBackgroundBlobFromR2).toHaveBeenCalledWith(
      "background_2",
    );
  });

  it("reuses a pending background blob download for concurrent callers", async () => {
    let resolveDownload: ((blob: Blob) => void) | undefined;
    const download = new Promise<Blob>((resolve) => {
      resolveDownload = resolve;
    });
    mocks.downloadSwiprBackgroundBlobFromR2.mockReturnValueOnce(download);
    const state = useSwiprLibraryState();

    const firstLoad = state.loadBackgroundBlob("background_1");
    const secondLoad = state.loadBackgroundBlob("background_1");
    const blob = new Blob(["background"], { type: "image/jpeg" });
    resolveDownload?.(blob);

    await expect(firstLoad).resolves.toBe(blob);
    await expect(secondLoad).resolves.toBe(blob);
    expect(mocks.downloadSwiprBackgroundBlobFromR2).toHaveBeenCalledTimes(1);
  });

  it("continues queued background downloads after a rejected download", async () => {
    mocks.downloadSwiprBackgroundBlobFromR2
      .mockRejectedValueOnce(new Error("download failed"))
      .mockResolvedValueOnce(new Blob(["second"], { type: "image/jpeg" }));
    const state = useSwiprLibraryState();

    await expect(state.loadBackgroundBlob("background_1")).rejects.toThrow(
      "download failed",
    );
    await expect(state.loadBackgroundBlob("background_2")).resolves.toEqual(
      expect.any(Blob),
    );

    expect(mocks.downloadSwiprBackgroundBlobFromR2).toHaveBeenNthCalledWith(
      2,
      "background_2",
    );
  });

  it("saves an analyzed background with dimensions and generation details", async () => {
    const state = useSwiprLibraryState();
    const blob = new Blob(["background"], { type: "image/jpeg" });

    await expect(
      state.saveBackground({
        blob,
        generationDetails: "Prompt: studio wall",
        libraryQuery: "desk setup",
        originalName: "wall.jpg",
        source: "ai",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        details: "Analyzed details\n\nGeneration metadata: Prompt: studio wall",
        id: "background_new",
        name: "Analyzed background",
        source: "ai",
      }),
    );

    expect(mocks.analyzeSwiprBackground).toHaveBeenCalledWith({
      blob,
      originalName: "wall.jpg",
    });
    expect(mocks.uploadSwiprBackgroundBlobToR2).toHaveBeenCalledWith({
      blob,
      recordId: "background_new",
    });
    expect(getMutation("swiprBackgrounds.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        details: "Analyzed details\n\nGeneration metadata: Prompt: studio wall",
        height: 1920,
        id: "background_new",
        imageObject: expect.objectContaining({
          key: "users/user_123/swipr/background_new.jpg",
        }),
        libraryQuery: "desk setup",
        mimeType: "image/jpeg",
        size: 123,
        width: 1080,
      }),
    );
  });

  it("omits empty background details when analysis and generation metadata are blank", async () => {
    mocks.analyzeSwiprBackground.mockResolvedValueOnce({
      description: "Analyzed description",
      details: "",
      name: "Analyzed background",
      tags: ["ai"],
    });
    const state = useSwiprLibraryState();

    await expect(
      state.saveBackground({
        blob: new Blob(["background"], { type: "image/jpeg" }),
        originalName: "wall.jpg",
        source: "upload",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        details: undefined,
      }),
    );

    expect(getMutation("swiprBackgrounds.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        details: undefined,
      }),
    );
  });

  it("saves swipes with generated timestamps and removes swipes by id", async () => {
    const state = useSwiprLibraryState();

    await expect(
      state.saveSwipe({
        backgroundId: "background_1",
        id: "swipe_new",
        name: "New Swipe",
        productContext: "Context",
        productName: "Product",
        productSourceId: "product_1",
        productSourceType: "saved-product",
        slides: [],
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        createdAt: expect.any(String),
        id: "swipe_new",
        updatedAt: expect.any(String),
      }),
    );
    await state.removeSwipe("swipe_new");

    expect(getMutation("swipes.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: expect.any(String),
        id: "swipe_new",
        updatedAt: expect.any(String),
      }),
    );
    expect(getMutation("swipes.remove")).toHaveBeenCalledWith({
      id: "swipe_new",
    });
  });

  it("updates Swipe posted status", async () => {
    const state = useSwiprLibraryState();
    const swipe = createSwipeDocument() as unknown as SwiprSwipe;

    await state.updateSwipePostedStatus(swipe, true);

    expect(getMutation("swipes.updatePostedStatus")).toHaveBeenCalledWith({
      id: "swipe_1",
      isPosted: true,
    });
  });

  it("preserves provided swipe timestamps", async () => {
    const state = useSwiprLibraryState();

    await expect(
      state.saveSwipe({
        backgroundId: "background_1",
        createdAt: "2026-01-01T00:00:00.000Z",
        id: "swipe_existing",
        name: "Existing Swipe",
        productContext: "Context",
        productName: "Product",
        productSourceId: "product_1",
        productSourceType: "saved-product",
        slides: [],
        updatedAt: "2026-01-02T00:00:00.000Z",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      }),
    );

    expect(getMutation("swipes.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      }),
    );
  });

  it("renders and saves a first-slide poster for Swipes", async () => {
    const state = useSwiprLibraryState();
    const firstSlide = {
      backgroundId: "background_1",
      id: "slide_1",
      textOverlay: {
        endTime: 1,
        fontSize: 48,
        startTime: 0,
        styleId: "hook",
        text: "Launch now",
        width: 0.8,
        x: 0.5,
        y: 0.5,
      },
    } satisfies SwiprSlide;

    await expect(
      state.saveSwipe({
        backgroundId: "background_1",
        id: "swipe_new",
        name: "New Swipe",
        productContext: "Context",
        productName: "Product",
        productSourceId: "product_1",
        productSourceType: "saved-product",
        slides: [firstSlide],
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        posterBlob: expect.any(Blob),
        posterObject: expect.objectContaining({
          key: "users/user_123/swipes/swipe_new/poster.png",
        }),
        posterVersion: 1,
      }),
    );

    expect(mocks.downloadSwiprBackgroundBlobFromR2).toHaveBeenCalledWith(
      "background_1",
    );
    expect(mocks.renderSwiprSlideBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      firstSlide,
    );
    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      {
        blob: expect.any(Blob),
        kind: "swipe-poster",
        recordId: "swipe_new",
      },
    ]);
    expect(getMutation("swipes.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "swipe_new",
        posterObject: expect.objectContaining({
          key: "users/user_123/swipes/swipe_new/poster.png",
        }),
        posterVersion: 1,
      }),
    );
  });

  it("surfaces save and delete failures", async () => {
    const state = useSwiprLibraryState();

    mocks.analyzeSwiprBackground.mockRejectedValueOnce(
      new Error("analysis failed"),
    );
    getMutation("swipes.remove").mockRejectedValueOnce(
      new Error("delete failed"),
    );

    await expect(
      state.saveBackground({
        blob: new Blob(["broken"], { type: "image/jpeg" }),
        originalName: "broken.jpg",
        source: "upload",
      }),
    ).rejects.toThrow("analysis failed");
    await expect(state.removeSwipe("swipe_1")).rejects.toThrow("delete failed");
  });

  it("surfaces swipe save failures", async () => {
    const state = useSwiprLibraryState();

    getMutation("swipes.save").mockRejectedValueOnce(new Error("save failed"));

    await expect(
      state.saveSwipe({
        backgroundId: "background_1",
        id: "swipe_new",
        name: "New Swipe",
        productContext: "Context",
        productName: "Product",
        productSourceId: "product_1",
        productSourceType: "saved-product",
        slides: [],
      }),
    ).rejects.toThrow("save failed");
  });

  it("hydrates background documents after authentication", async () => {
    mocks.useEffect.mockImplementationOnce(
      (effect: () => void | (() => void)) => effect(),
    );

    useSwiprLibraryState();
    await Promise.resolve();

    expect(mocks.createSwiprBackgroundAssetFromConvexDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: "background_1" }),
      undefined,
    );
    expect(mocks.useStateSetter).toHaveBeenCalledWith([
      { id: "background_1", name: "Mapped background" },
    ]);
  });

  it("clears cached backgrounds when authentication is resolved signed out", async () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    mocks.useEffect.mockImplementationOnce(
      (effect: () => void | (() => void)) => effect(),
    );

    useSwiprLibraryState();
    await Promise.resolve();

    expect(mocks.useStateSetter).toHaveBeenCalledWith([]);
  });

  it("skips background hydration after the effect cleanup runs", async () => {
    let cleanup: (() => void) | undefined;
    mocks.useEffect.mockImplementationOnce(
      (effect: () => void | (() => void)) => {
        cleanup = effect() ?? undefined;
      },
    );

    useSwiprLibraryState();
    cleanup?.();
    await Promise.resolve();

    expect(
      mocks.createSwiprBackgroundAssetFromConvexDocument,
    ).not.toHaveBeenCalled();
  });
});
