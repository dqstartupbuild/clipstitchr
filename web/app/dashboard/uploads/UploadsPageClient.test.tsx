import { beforeEach, describe, expect, it, vi } from "vitest";
import { UploadsPageClient } from "@/app/dashboard/uploads/UploadsPageClient";
import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/showUploadControlsEventName";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type ElementLike = {
  props?: Record<string, unknown>;
  type?: unknown;
};

type TestWindow = {
  addEventListener: (type: string, listener: EventListener) => void;
  history: {
    replaceState: ReturnType<typeof vi.fn>;
  };
  location: {
    href: string;
    search: string;
  };
  removeEventListener: (type: string, listener: EventListener) => void;
};

const mocks = vi.hoisted(() => ({
  avatarCreator: {
    createdAvatar: null as { name: string } | null,
    error: null as string | null,
    generatedCount: 0,
    generate: vi.fn(),
    isGenerating: false,
  },
  library: {} as Record<string, unknown>,
  listeners: new Map<string, EventListener[]>(),
  photoLibrary: {} as Record<string, unknown>,
  products: {} as Record<string, unknown>,
  stateSetter: vi.fn(),
  stateValues: [] as unknown[],
  swiprLibrary: {} as Record<string, unknown>,
  useClipLibrary: vi.fn(),
  useCreateAvatarFromUgcClip: vi.fn(),
  usePhotoLibrary: vi.fn(),
  useProducts: vi.fn(),
  useShowUploadControls: vi.fn(),
  useSwiprLibrary: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useEffect: (effect: () => void | (() => void)) => {
      effect();
    },
    useMemo: (factory: () => unknown) => factory(),
    useState: (initialValue: unknown) => {
      const defaultValue =
        typeof initialValue === "function"
          ? (initialValue as () => unknown)()
          : initialValue;
      const value = mocks.stateValues.length
        ? mocks.stateValues.shift()
        : defaultValue;

      return [value, mocks.stateSetter];
    },
  };
});

vi.mock("@/lib/clipstitchr/hooks/useClipLibrary", () => ({
  useClipLibrary: mocks.useClipLibrary,
}));

vi.mock("@/lib/clipstitchr/hooks/useCreateAvatarFromUgcClip", () => ({
  useCreateAvatarFromUgcClip: mocks.useCreateAvatarFromUgcClip,
}));

vi.mock("@/lib/clipstitchr/hooks/usePhotoLibrary", () => ({
  usePhotoLibrary: mocks.usePhotoLibrary,
}));

vi.mock("@/lib/clipstitchr/hooks/useProducts", () => ({
  useProducts: mocks.useProducts,
}));

vi.mock("@/lib/clipstitchr/hooks/useShowUploadControls", () => ({
  useShowUploadControls: mocks.useShowUploadControls,
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprLibrary", () => ({
  useSwiprLibrary: mocks.useSwiprLibrary,
}));

class TestCustomEvent<T = unknown> extends Event {
  detail: T;

  constructor(type: string, init?: { detail?: T }) {
    super(type);
    this.detail = init?.detail as T;
  }
}

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "A launch kit",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

function createClip(
  id: string,
  clipType: "ugc" | "demo",
  overrides: Partial<VideoClipMetadata> = {},
): VideoClipMetadata {
  return {
    clipType,
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 10,
    height: 1920,
    id,
    mimeType: "video/mp4",
    name: `${clipType} ${id}`,
    objectKey: `clips/${id}.mp4`,
    size: 100,
    tags: [clipType],
    width: 1080,
    ...overrides,
  } as VideoClipMetadata;
}

function createWindow(search = "?tab=all") {
  mocks.listeners.clear();
  const initialUrl = new URL(`https://clipstitchr.test/dashboard/uploads${search}`);
  const testWindow: TestWindow = {
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      const listeners = mocks.listeners.get(type) ?? [];
      listeners.push(listener);
      mocks.listeners.set(type, listeners);
    }),
    history: {
      replaceState: vi.fn((_state, _title, nextUrl: string) => {
        const url = new URL(nextUrl);
        testWindow.location.href = url.toString();
        testWindow.location.search = url.search;
      }),
    },
    location: {
      href: initialUrl.toString(),
      search: initialUrl.search,
    },
    removeEventListener: vi.fn((type: string, listener: EventListener) => {
      mocks.listeners.set(
        type,
        (mocks.listeners.get(type) ?? []).filter(
          (currentListener) => currentListener !== listener,
        ),
      );
    }),
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: testWindow,
  });
  Object.defineProperty(globalThis, "CustomEvent", {
    configurable: true,
    value: TestCustomEvent,
  });

  return testWindow;
}

function collectElements(element: unknown): ElementLike[] {
  if (Array.isArray(element)) {
    return element.flatMap(collectElements);
  }

  if (
    !element ||
    typeof element !== "object" ||
    !("props" in element) ||
    !("type" in element)
  ) {
    return [];
  }

  const elementLike = element as ElementLike;

  return [
    elementLike,
    ...collectElements(elementLike.props?.children),
  ];
}

function renderUploadsPage({
  search = "?tab=all",
  stateValues = [],
}: {
  search?: string;
  stateValues?: unknown[];
} = {}) {
  const testWindow = createWindow(search);
  mocks.stateValues = [...stateValues];

  return {
    elements: collectElements(UploadsPageClient()),
    testWindow,
  };
}

function findByProp(elements: ElementLike[], prop: string, value: unknown) {
  return elements.find((element) => element.props?.[prop] === value);
}

function dispatchWindowEvent(type: string, event: Event) {
  for (const listener of mocks.listeners.get(type) ?? []) {
    listener(event);
  }
}

describe("UploadsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.avatarCreator.createdAvatar = { name: "Ava" };
    mocks.avatarCreator.error = "Avatar error";
    mocks.avatarCreator.generatedCount = 3;
    mocks.avatarCreator.generate.mockResolvedValue({ id: "avatar_1" });
    mocks.avatarCreator.isGenerating = true;
    const ugcClip = createClip("ugc_1", "ugc");
    const cliprClip = createClip("clipr_1", "ugc", {
      cliprMetadata: { prompt: "Hook" } as unknown as VideoClipMetadata["cliprMetadata"],
      name: "Clipr hook",
    });
    const demoClip = createClip("demo_1", "demo", {
      name: "Demo match",
      productId: "product_1",
    });
    const swapClip = createClip("swap_1", "ugc", {
      name: "Swap match",
      swaprMetadata: {
        createdAt: "2026-05-20T00:00:00.000Z",
        source: "swapr",
      } as unknown as VideoClipMetadata["swaprMetadata"],
    });
    mocks.library = {
      clips: [ugcClip, cliprClip, demoClip, swapClip],
      counts: {
        cliprClips: 20,
        demoClips: 30,
        stitches: 50,
        swapClips: 40,
        ugcClips: 10,
      },
      error: "Library error",
      generateCliprMusic: vi.fn(),
      generateStitchMusic: vi.fn(),
      hasMoreClips: true,
      hasMoreStitches: true,
      isLoadingMoreClips: false,
      isLoadingMoreStitches: false,
      loadClip: vi.fn(),
      loadClipPoster: vi.fn(),
      loadMoreClips: vi.fn(),
      loadMoreStitches: vi.fn(),
      loadStitchPoster: vi.fn(),
      refresh: vi.fn(),
      removeClip: vi.fn(),
      removeStitch: vi.fn(),
      setSortOrder: vi.fn(),
      sortOrder: "newest",
      stitches: [{ id: "stitch_1", name: "Stitch match" }],
      updateClipMetadata: vi.fn(),
      updateCliprMusic: vi.fn(),
      updateClipTrimRange: vi.fn(),
      updateStitchMusic: vi.fn(),
      updateStitchTextOverlay: vi.fn(),
      videoGroups: {
        clipr: {
          clips: [cliprClip],
          hasMoreItems: true,
          isLoadingMoreItems: false,
          loadMoreItems: vi.fn(),
        },
        demo: {
          clips: [demoClip],
          hasMoreItems: true,
          isLoadingMoreItems: false,
          loadMoreItems: vi.fn(),
        },
        swapr: {
          clips: [swapClip],
          hasMoreItems: true,
          isLoadingMoreItems: false,
          loadMoreItems: vi.fn(),
        },
        ugc: {
          clips: [ugcClip],
          hasMoreItems: true,
          isLoadingMoreItems: false,
          loadMoreItems: vi.fn(),
        },
      },
    };
    mocks.photoLibrary = {
      createAvatar: vi.fn(),
      isSaving: false,
      saveFiles: vi.fn(),
      saveGeneratedPhotos: vi.fn(),
    };
    mocks.products = {
      error: null,
      isLoading: false,
      products: [createProduct()],
    };
    mocks.swiprLibrary = {
      backgrounds: [{ id: "background_1", name: "Background" }],
      error: null,
      loadBackgroundBlob: vi.fn(),
      loadSwipePoster: vi.fn(),
      removeSwipe: vi.fn(),
      swipes: [
        {
          backgroundId: "background_1",
          createdAt: "2026-05-20T00:00:00.000Z",
          id: "swipe_1",
          name: "Swipe match",
          productContext: "Context",
          productName: "Launch Kit",
          productSourceId: "product_1",
          productSourceType: "saved-product",
          slides: [],
          updatedAt: "2026-05-20T00:00:00.000Z",
        },
      ],
    };
    mocks.useClipLibrary.mockReturnValue(mocks.library);
    mocks.useCreateAvatarFromUgcClip.mockReturnValue(mocks.avatarCreator);
    mocks.usePhotoLibrary.mockReturnValue(mocks.photoLibrary);
    mocks.useProducts.mockReturnValue(mocks.products);
    mocks.useShowUploadControls.mockReturnValue(true);
    mocks.useSwiprLibrary.mockReturnValue(mocks.swiprLibrary);
  });

  it("renders the all library tab and wires upload controls", async () => {
    const { elements, testWindow } = renderUploadsPage();
    const uploadPanel = elements.find((element) =>
      Array.isArray(element.props?.allowedAssetTypes),
    );
    const ugcSection = findByProp(elements, "id", "ugc-clips");

    expect(mocks.useCreateAvatarFromUgcClip).toHaveBeenCalledWith({
      createAvatar: mocks.photoLibrary.createAvatar,
      loadClip: mocks.library.loadClip,
      saveGeneratedPhotos: mocks.photoLibrary.saveGeneratedPhotos,
    });
    expect(uploadPanel?.props).toEqual(
      expect.objectContaining({
        canUploadDemo: true,
        demoProductId: "product_1",
        initialAssetType: "ugc",
      }),
    );
    expect(
      (elements.filter((element) => element.props?.loadMoreLabel) ?? []).length,
    ).toBe(4);
    expect(ugcSection?.props?.totalCount).toBe(10);
    expect(findByProp(elements, "id", "clips")?.props?.totalCount).toBe(20);
    expect(findByProp(elements, "id", "demo-videos")?.props?.totalCount).toBe(30);
    expect(findByProp(elements, "id", "swaps")?.props?.totalCount).toBe(40);

    await expect(
      (
        ugcSection?.props?.onCreateAvatarFromClip as (
          clip: VideoClipMetadata,
          options: Record<string, unknown>,
        ) => Promise<boolean>
      )(createClip("ugc_2", "ugc"), { avatarName: "Ava" }),
    ).resolves.toBe(true);
    (uploadPanel?.props?.onAssetTypeChange as (assetType: UploadAssetType) => void)(
      "demo",
    );

    expect(testWindow.history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      expect.stringContaining("tab=demo"),
    );
  });

  it("syncs tab state from popstate and upload-control events", () => {
    const { testWindow } = renderUploadsPage({ search: "?tab=ugc" });

    dispatchWindowEvent("popstate", new Event("popstate"));
    dispatchWindowEvent(
      SHOW_UPLOAD_CONTROLS_EVENT_NAME,
      new Event(SHOW_UPLOAD_CONTROLS_EVENT_NAME),
    );
    dispatchWindowEvent(
      SHOW_UPLOAD_CONTROLS_EVENT_NAME,
      new CustomEvent(SHOW_UPLOAD_CONTROLS_EVENT_NAME, {
        detail: { assetType: "demo" },
      }),
    );

    expect(testWindow.addEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
    expect(mocks.stateSetter).toHaveBeenCalledWith("ugc");
    expect(testWindow.history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      expect.stringContaining("tab=demo"),
    );
  });

  it("renders a searched UGC tab with avatar generation controls", async () => {
    const { elements } = renderUploadsPage({
      stateValues: ["ugc", "match", "all", ""],
    });
    const section = findByProp(elements, "id", "ugc-clips");

    mocks.avatarCreator.generate.mockResolvedValueOnce(null);

    expect(section?.props).toEqual(
      expect.objectContaining({
        avatarCreatorError: "Avatar error",
        emptyTitle: "No matching UGC",
        isCreatingAvatarFromClip: true,
        totalCount: undefined,
      }),
    );
    await expect(
      (
        section?.props?.onCreateAvatarFromClip as (
          clip: VideoClipMetadata,
          options: Record<string, unknown>,
        ) => Promise<boolean>
      )(createClip("ugc_2", "ugc"), {}),
    ).resolves.toBe(false);
  });

  it("renders demo tab product filters and blocked upload copy", () => {
    mocks.products = {
      error: null,
      isLoading: true,
      products: [],
    };
    mocks.useProducts.mockReturnValue(mocks.products);

    const { elements } = renderUploadsPage({
      stateValues: ["demo", "", "missing_product", "missing_product"],
    });
    const section = findByProp(elements, "id", "demo-videos");
    const uploadPanel = elements.find((element) =>
      Array.isArray(element.props?.allowedAssetTypes),
    );

    expect(section?.props).toEqual(
      expect.objectContaining({
        emptyTitle: "No demo videos yet",
      }),
    );
    expect(uploadPanel?.props).toEqual(
      expect.objectContaining({
        canUploadDemo: false,
        demoProductId: "",
        demoUploadBlockedMessage: "Products are loading.",
      }),
    );
  });

  it("uses product-specific demo empty copy when a valid product filter is active", () => {
    const { elements } = renderUploadsPage({
      stateValues: ["demo", "", "product_1", "product_1"],
    });
    const section = findByProp(elements, "id", "demo-videos");

    expect(section?.props).toEqual(
      expect.objectContaining({
        emptyDescription: "No saved demo videos are linked to that product.",
        emptyTitle: "No demos for this product",
        totalCount: undefined,
      }),
    );
  });

  it("renders non-video library tabs", () => {
    const stitches = renderUploadsPage({
      stateValues: ["stitches", "stitch", "all", ""],
    }).elements;
    const swipes = renderUploadsPage({
      stateValues: ["swipes", "swipe", "all", ""],
    }).elements;

    expect(stitches.some((element) => "stitches" in (element.props ?? {}))).toBe(
      true,
    );
    expect(swipes.some((element) => "swipes" in (element.props ?? {}))).toBe(
      true,
    );
  });

  it("renders clip and swap tabs without upload controls", () => {
    mocks.useShowUploadControls.mockReturnValue(false);

    const clips = renderUploadsPage({
      stateValues: ["clips", "", "all", ""],
    }).elements;
    const swaps = renderUploadsPage({
      stateValues: ["swaps", "", "all", ""],
    }).elements;

    expect(findByProp(clips, "id", "clips")?.props?.title).toBe("Clips");
    expect(findByProp(swaps, "id", "swaps")?.props?.title).toBe("Swaps");
    expect(
      clips.some((element) => Array.isArray(element.props?.allowedAssetTypes)),
    ).toBe(false);
  });

  it("falls back to downstream errors when the clip library has none", () => {
    mocks.library = { ...mocks.library, error: null };
    mocks.swiprLibrary = { ...mocks.swiprLibrary, error: "Swipr error" };
    mocks.products = { ...mocks.products, error: "Product error" };
    mocks.useClipLibrary.mockReturnValue(mocks.library);
    mocks.useProducts.mockReturnValue(mocks.products);
    mocks.useSwiprLibrary.mockReturnValue(mocks.swiprLibrary);

    const { elements } = renderUploadsPage();

    expect(
      elements.some((element) =>
        String(element.props?.children).includes("Swipr error"),
      ),
    ).toBe(true);
  });
});
