import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSwiprLibraryState } from "@/lib/clipstitchr/hooks/useSwiprLibraryState";

const mocks = vi.hoisted(() => {
  const mutationFns = new Map<string, ReturnType<typeof vi.fn>>();

  return {
    analyzeSwiprBackground: vi.fn(),
    createId: vi.fn(),
    createSwiprBackgroundAssetFromConvexDocument: vi.fn(),
    createSwiprSwipeFromConvexDocument: vi.fn(),
    downloadSwiprBackgroundBlobFromR2: vi.fn(),
    getImageDimensions: vi.fn(),
    mutationFns,
    uploadSwiprBackgroundBlobToR2: vi.fn(),
    useConvexAuth: vi.fn(),
    useEffect: vi.fn(),
    useMutation: vi.fn((mutationId: string) => {
      const mutation = mutationFns.get(mutationId) ?? vi.fn();

      mutationFns.set(mutationId, mutation);
      return mutation;
    }),
    useQuery: vi.fn(),
    useStateSetter: vi.fn(),
  };
});

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useEffect: mocks.useEffect,
  useMemo: (factory: () => unknown) => factory(),
  useRef: (value: unknown) => ({ current: value }),
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.useStateSetter,
  ],
}));

vi.mock("convex/react", () => ({
  useConvexAuth: mocks.useConvexAuth,
  useMutation: mocks.useMutation,
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    swipes: {
      list: "swipes.list",
      remove: "swipes.remove",
      save: "swipes.save",
    },
    swiprBackgrounds: {
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

vi.mock(
  "@/lib/clipstitchr/client/r2/uploadSwiprBackgroundBlobToR2",
  () => ({
    uploadSwiprBackgroundBlobToR2: mocks.uploadSwiprBackgroundBlobToR2,
  }),
);

vi.mock("@/lib/clipstitchr/media/getImageDimensions", () => ({
  getImageDimensions: mocks.getImageDimensions,
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
    mocks.useQuery.mockImplementation((queryId: string) => {
      if (queryId === "swiprBackgrounds.list") {
        return [createBackgroundDocument()];
      }

      if (queryId === "swipes.list") {
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
    mocks.getImageDimensions.mockResolvedValue({ height: 1920, width: 1080 });
    mocks.uploadSwiprBackgroundBlobToR2.mockResolvedValue({
      contentType: "image/jpeg",
      key: "users/user_123/swipr/background_new.jpg",
      size: 123,
    });
  });

  it("maps authenticated swipe documents and queries owned libraries", () => {
    const state = useSwiprLibraryState();

    expect(state.swipes).toEqual([{ id: "swipe_1", name: "Mapped swipe" }]);
    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith("swiprBackgrounds.list", {});
    expect(mocks.useQuery).toHaveBeenCalledWith("swipes.list", {});
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

  it("saves an analyzed background with dimensions and generation details", async () => {
    const state = useSwiprLibraryState();
    const blob = new Blob(["background"], { type: "image/jpeg" });

    await expect(
      state.saveBackground({
        blob,
        generationDetails: "Prompt: studio wall",
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
        mimeType: "image/jpeg",
        size: 123,
        width: 1080,
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
});
