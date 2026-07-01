import { beforeEach, describe, expect, it, vi } from "vitest";
import { LibraryPageClient } from "@/app/dashboard/library/LibraryPageClient";
import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/showUploadControlsEventName";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";
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
  avatarTabProps: null as Record<string, unknown> | null,
  library: {} as Record<string, unknown>,
  listeners: new Map<string, EventListener[]>(),
  pexelsTabProps: null as Record<string, unknown> | null,
  photoLibrary: {} as Record<string, unknown>,
  products: {} as Record<string, unknown>,
  stateSetter: vi.fn(),
  stateValues: [] as unknown[],
  stitchTemplates: {
    createTemplateFromStitch: vi.fn(),
    deleteTemplate: vi.fn(),
    deletingTemplateId: null as string | null,
    error: null as string | null,
    isLoading: false,
    renameTemplate: vi.fn(),
    savingStitchId: null as string | null,
    savingTemplateId: null as string | null,
    templates: [],
  },
  swiprLibrary: {} as Record<string, unknown>,
  templateTabProps: null as Record<string, unknown> | null,
  useClipLibrary: vi.fn(),
  useCreateAvatarFromUgcClip: vi.fn(),
  usePhotoLibrary: vi.fn(),
  useProducts: vi.fn(),
  useShowUploadControls: vi.fn(),
  useStitchrHookPlans: vi.fn(),
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

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => {
    const productState = mocks.products as {
      defaultProductId?: string;
      error?: string | null;
      isLoading?: boolean;
      products?: ProductProfile[];
    };
    const products = productState.products ?? [];
    const activeProduct =
      products.find((product) => product.id === productState.defaultProductId) ??
      products[0];

    return {
      activeProduct,
      activeProductId: activeProduct?.id,
      defaultProductId: productState.defaultProductId,
      error: productState.error ?? null,
      isBackfillingLegacyContent: false,
      isCreating: false,
      isLoading: productState.isLoading ?? false,
      isSaving: false,
      products,
      requiresProductSetup: false,
      requiresOnboarding: false,
      createProduct: vi.fn(),
      markOnboardingCompletedLocally: vi.fn(),
      setActiveProduct: vi.fn(),
      updateProduct: vi.fn(),
    };
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useShowUploadControls", () => ({
  useShowUploadControls: mocks.useShowUploadControls,
}));

vi.mock("@/lib/clipstitchr/hooks/useStitchTemplates", () => ({
  useStitchTemplates: () => mocks.stitchTemplates,
}));

vi.mock("@/lib/clipstitchr/hooks/useStitchrHookPlans", () => ({
  useStitchrHookPlans: mocks.useStitchrHookPlans,
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprLibrary", () => ({
  useSwiprLibrary: mocks.useSwiprLibrary,
}));

vi.mock("@/app/_components/library/AvatarLibraryTabSection", () => ({
  AvatarLibraryTabSection: (props: Record<string, unknown>) => {
    mocks.avatarTabProps = props;
    return "AvatarLibraryTabSection";
  },
}));

vi.mock("@/app/_components/library/TemplateLibraryTabSection", () => ({
  TemplateLibraryTabSection: (props: Record<string, unknown>) => {
    mocks.templateTabProps = props;
    return "TemplateLibraryTabSection";
  },
}));

vi.mock("@/app/_components/library/PexelsLibraryTabSection", () => ({
  PexelsLibraryTabSection: (props: Record<string, unknown>) => {
    mocks.pexelsTabProps = props;
    return "PexelsLibraryTabSection";
  },
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

function createWindow(search = "") {
  mocks.listeners.clear();
  const initialUrl = new URL(`https://clipstitchr.test/dashboard/library${search}`);
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

function renderLibraryPage({
  search = "",
  stateValues = [],
}: {
  search?: string;
  stateValues?: unknown[];
} = {}) {
  const testWindow = createWindow(search);
  mocks.stateValues = [...stateValues];

  return {
    elements: collectElements(LibraryPageClient()),
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

describe("LibraryPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.avatarCreator.createdAvatar = { name: "Ava" };
    mocks.avatarCreator.error = "Avatar error";
    mocks.avatarCreator.generatedCount = 3;
    mocks.avatarCreator.generate.mockResolvedValue({ id: "avatar_1" });
    mocks.avatarCreator.isGenerating = true;
    mocks.avatarTabProps = null;
    mocks.pexelsTabProps = null;
    mocks.templateTabProps = null;
    const ugcClip = createClip("ugc_1", "ugc");
    const cliprClip = createClip("clipr_1", "ugc", {
      cliprMetadata: { prompt: "Hook" } as unknown as VideoClipMetadata["cliprMetadata"],
      name: "Clipr hook",
    });
    const postedCliprClip = createClip("posted_clipr_1", "ugc", {
      cliprMetadata: { prompt: "Posted Hook" } as unknown as VideoClipMetadata["cliprMetadata"],
      createdAt: "2026-05-21T00:00:00.000Z",
      isPosted: true,
      name: "Posted Clipr hook",
      postedAt: "2026-05-21T00:00:00.000Z",
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
        activeStitches: 50,
        cliprClips: 0,
        demoClips: 30,
        postedStitches: 1,
        stitches: 50,
        swapClips: 40,
        ugcClips: 30,
      },
      error: "Library error",
      hasMoreClips: true,
      hasMorePostedStitches: true,
      hasMoreStitches: true,
      isLoadingMoreClips: false,
      isLoadingMorePostedStitches: false,
      isLoadingMoreStitches: false,
      loadClip: vi.fn(),
      loadClipPoster: vi.fn(),
      loadMoreClips: vi.fn(),
      loadMorePostedStitches: vi.fn(),
      loadMoreStitches: vi.fn(),
      loadStitch: vi.fn(),
      loadStitchPoster: vi.fn(),
      postedStitches: [
        {
          createdAt: "2026-05-21T00:00:00.000Z",
          id: "posted_stitch_1",
          isPosted: true,
          name: "Posted stitch match",
          postedAt: "2026-05-21T00:00:00.000Z",
        },
      ],
      refresh: vi.fn(),
      removeClip: vi.fn(),
      removeStitch: vi.fn(),
      setSortOrder: vi.fn(),
      sortOrder: "newest",
      stitches: [
        {
          createdAt: "2026-05-20T00:00:00.000Z",
          id: "stitch_1",
          name: "Stitch match",
        },
      ],
      updateClipMetadata: vi.fn(),
      updateCliprMusic: vi.fn(),
      updateClipTrimRange: vi.fn(),
      updateStitchMusic: vi.fn(),
      updateStitchPostedStatus: vi.fn(),
      updateStitchSocialCaption: vi.fn(),
      updateStitchSourceSettings: vi.fn(),
      updateStitchTextOverlay: vi.fn(),
      videoGroups: {
        clipr: {
          clips: [cliprClip],
          postedClips: [postedCliprClip],
          hasMoreItems: true,
          hasMorePostedItems: true,
          isLoadingMoreItems: false,
          isLoadingMorePostedItems: false,
          loadMoreItems: vi.fn(),
          loadMorePostedItems: vi.fn(),
        },
        demo: {
          clips: [demoClip],
          postedClips: [],
          hasMoreItems: true,
          hasMorePostedItems: false,
          isLoadingMoreItems: false,
          isLoadingMorePostedItems: false,
          loadMoreItems: vi.fn(),
          loadMorePostedItems: vi.fn(),
        },
        swapr: {
          clips: [swapClip],
          postedClips: [],
          hasMoreItems: true,
          hasMorePostedItems: false,
          isLoadingMoreItems: false,
          isLoadingMorePostedItems: false,
          loadMoreItems: vi.fn(),
          loadMorePostedItems: vi.fn(),
        },
        ugc: {
          clips: [ugcClip, cliprClip, postedCliprClip],
          postedClips: [],
          hasMoreItems: true,
          hasMorePostedItems: false,
          isLoadingMoreItems: false,
          isLoadingMorePostedItems: false,
          loadMoreItems: vi.fn(),
          loadMorePostedItems: vi.fn(),
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
      defaultProductId: undefined,
      error: null,
      isLoading: false,
      products: [createProduct()],
    };
    mocks.swiprLibrary = {
      addLibraryPackToAccount: vi.fn(),
      backgrounds: [{ id: "background_1", name: "Background" }],
      error: null,
      globalPexelsBackgrounds: [
        {
          id: "background_pexels",
          libraryQuery: "desk setup",
          name: "Desk setup",
          source: "pexels",
        },
      ],
      isLoading: false,
      loadBackgroundAsset: vi.fn(),
      loadBackgroundBlob: vi.fn(),
      loadSwipePoster: vi.fn(),
      removeBackgroundFromLibraryPack: vi.fn(),
      removeLibraryPack: vi.fn(),
      removeLibraryPackFromAccount: vi.fn(),
      removeSwipe: vi.fn(),
      postedSwipes: [
        {
          backgroundId: "background_1",
          createdAt: "2026-05-21T00:00:00.000Z",
          id: "posted_swipe_1",
          isPosted: true,
          name: "Posted Swipe match",
          postedAt: "2026-05-21T00:00:00.000Z",
          productContext: "Context",
          productName: "Launch Kit",
          productSourceId: "product_1",
          productSourceType: "saved-product",
          slides: [],
          updatedAt: "2026-05-21T00:00:00.000Z",
        },
      ],
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
      updateSwipePostedStatus: vi.fn(),
    };
    mocks.useClipLibrary.mockReturnValue(mocks.library);
    mocks.useCreateAvatarFromUgcClip.mockReturnValue(mocks.avatarCreator);
    mocks.usePhotoLibrary.mockReturnValue(mocks.photoLibrary);
    mocks.useProducts.mockReturnValue(mocks.products);
    mocks.useShowUploadControls.mockReturnValue(true);
    mocks.useStitchrHookPlans.mockReturnValue({
      accept: vi.fn(),
      error: null,
      isLoading: false,
      plans: [],
      reject: vi.fn(),
      saveManualGeneration: vi.fn(),
      savingPlanId: null,
      selectOption: vi.fn(),
    });
    mocks.useSwiprLibrary.mockReturnValue(mocks.swiprLibrary);
  });

  it("renders the UGC library tab by default and wires upload controls", async () => {
    const { elements, testWindow } = renderLibraryPage();
    const uploadPanel = elements.find((element) =>
      Array.isArray(element.props?.allowedAssetTypes),
    );
    const ugcSection = findByProp(elements, "id", "ugc-clips");

    expect(mocks.useCreateAvatarFromUgcClip).toHaveBeenCalledWith({
      createAvatar: mocks.photoLibrary.createAvatar,
      loadClip: mocks.library.loadClip,
      saveGeneratedPhotos: mocks.photoLibrary.saveGeneratedPhotos,
    });
    expect(mocks.useStitchrHookPlans).toHaveBeenCalledWith(
      "product_1",
      false,
    );
    expect(uploadPanel?.props).toEqual(
      expect.objectContaining({
        canUploadDemo: true,
        demoProductId: "product_1",
        initialAssetType: "ugc",
      }),
    );
    expect(ugcSection?.props?.totalCount).toBe(30);
    expect(ugcSection?.props?.clips).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "clipr_1" }),
      ]),
    );
    expect(findByProp(elements, "id", "clips")).toBeUndefined();
    expect(findByProp(elements, "id", "demo-videos")).toBeUndefined();
    expect(findByProp(elements, "id", "swaps")).toBeUndefined();

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

  it("renders the Pexels library tab with global and account packs", () => {
    const { elements } = renderLibraryPage({ search: "?tab=pexels" });
    const pexelsSection = elements.find(
      (element) => "allBackgrounds" in (element.props ?? {}),
    );

    expect(pexelsSection?.props).toEqual(
      expect.objectContaining({
        allBackgrounds: mocks.swiprLibrary.globalPexelsBackgrounds,
        mineBackgrounds: mocks.swiprLibrary.backgrounds,
        onAddPackToAccount: mocks.swiprLibrary.addLibraryPackToAccount,
        onLoadBackgroundBlob: mocks.swiprLibrary.loadBackgroundBlob,
        onRemovePackFromAccount:
          mocks.swiprLibrary.removeLibraryPackFromAccount,
        searchQuery: "",
      }),
    );
  });

  it("syncs tab state from popstate and upload-control events", () => {
    const { testWindow } = renderLibraryPage({ search: "?tab=ugc" });

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
    const { elements } = renderLibraryPage({
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
      defaultProductId: undefined,
      error: null,
      isLoading: true,
      products: [],
    };
    mocks.useProducts.mockReturnValue(mocks.products);

    const { elements } = renderLibraryPage({
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

  it("uses the default product for demo upload and demo filtering", () => {
    const secondProduct = createProduct({
      id: "product_2",
      name: "Second Product",
    });
    const defaultDemoClip = createClip("demo_2", "demo", {
      name: "Default demo",
      productId: "product_2",
    });

    mocks.products = {
      ...mocks.products,
      defaultProductId: "product_2",
      products: [createProduct(), secondProduct],
    };
    mocks.library = {
      ...mocks.library,
      videoGroups: {
        ...(mocks.library.videoGroups as Record<string, unknown>),
        demo: {
          clips: [
            createClip("demo_1", "demo", {
              name: "First demo",
              productId: "product_1",
            }),
            defaultDemoClip,
          ],
          postedClips: [],
          hasMoreItems: false,
          hasMorePostedItems: false,
          isLoadingMoreItems: false,
          isLoadingMorePostedItems: false,
          loadMoreItems: vi.fn(),
          loadMorePostedItems: vi.fn(),
        },
      },
    };
    mocks.useProducts.mockReturnValue(mocks.products);
    mocks.useClipLibrary.mockReturnValue(mocks.library);

    const { elements } = renderLibraryPage({
      stateValues: ["demo", "", undefined, ""],
    });
    const section = findByProp(elements, "id", "demo-videos");
    const uploadPanel = elements.find((element) =>
      Array.isArray(element.props?.allowedAssetTypes),
    );

    expect(uploadPanel?.props?.demoProductId).toBe("product_2");
    expect(section?.props?.clips).toEqual([
      expect.objectContaining({ id: "demo_1" }),
      defaultDemoClip,
    ]);
  });

  it("uses generic demo empty copy because product scoping happens in the library query", () => {
    mocks.library = {
      ...mocks.library,
      videoGroups: {
        ...(mocks.library.videoGroups as Record<string, unknown>),
        demo: {
          clips: [],
          postedClips: [],
          hasMoreItems: false,
          hasMorePostedItems: false,
          isLoadingMoreItems: false,
          isLoadingMorePostedItems: false,
          loadMoreItems: vi.fn(),
          loadMorePostedItems: vi.fn(),
        },
      },
    };
    mocks.useClipLibrary.mockReturnValue(mocks.library);

    const { elements } = renderLibraryPage({
      stateValues: ["demo", "", "active", "active"],
    });
    const section = findByProp(elements, "id", "demo-videos");

    expect(section?.props).toEqual(
      expect.objectContaining({
        emptyDescription:
          "Upload product walkthroughs or screen recordings to use after UGC.",
        emptyTitle: "No demo videos yet",
        totalCount: 30,
      }),
    );
  });

  it("renders non-video library tabs", () => {
    const accept = vi.fn();
    const reject = vi.fn();
    const selectOption = vi.fn();
    const hookPlan = {
      createdAt: "2026-06-17T00:00:00.000Z",
      demoClipId: "demo_1",
      hashtags: [],
      hookOptions: [
        {
          angle: "Pain",
          reason: "Matches the demo.",
          text: "Stop scrolling for this.",
        },
      ],
      id: "hook_plan_1",
      selectedHook: "Stop scrolling for this.",
      source: "manual",
      status: "planned",
      stitchId: "stitch_1",
      ugcClipId: "ugc_1",
      updatedAt: "2026-06-17T00:00:00.000Z",
    } satisfies StitchrHookPlan;

    mocks.useStitchrHookPlans.mockReturnValue({
      accept,
      error: null,
      isLoading: false,
      plans: [hookPlan],
      reject,
      saveManualGeneration: vi.fn(),
      savingPlanId: "hook_plan_1",
      selectOption,
    });

    const stitches = renderLibraryPage({
      stateValues: ["stitches", "stitch", "all", ""],
    }).elements;
    expect(mocks.useStitchrHookPlans).toHaveBeenLastCalledWith(
      "product_1",
      true,
    );

    const swipes = renderLibraryPage({
      stateValues: ["swipes", "swipe", "all", ""],
    }).elements;
    expect(mocks.useStitchrHookPlans).toHaveBeenLastCalledWith(
      "product_1",
      false,
    );

    const stitchSection = stitches.find(
      (element) => "stitches" in (element.props ?? {}),
    );

    expect(stitchSection?.props).toEqual(
      expect.objectContaining({
        hookPlans: [hookPlan],
        savingHookPlanId: "hook_plan_1",
        onAcceptHookVariant: accept,
        onRejectHookVariant: reject,
        onSelectHookVariant: selectOption,
      }),
    );
    expect(swipes.some((element) => "swipes" in (element.props ?? {}))).toBe(
      true,
    );
  });

  it("renders avatar and template tabs inside the Library", () => {
    const avatarElements = renderLibraryPage({
      stateValues: ["avatars", "avatar", "active", "active"],
    }).elements;
    const avatarTab = findByProp(avatarElements, "showUploadControls", true);

    expect(avatarTab?.props).toEqual(
      expect.objectContaining({
        searchQuery: "avatar",
        showUploadControls: true,
      }),
    );

    const templateElements = renderLibraryPage({
      stateValues: ["templates", "template", "active", "active"],
    }).elements;
    const templateTab = findByProp(
      templateElements,
      "templates",
      mocks.stitchTemplates.templates,
    );

    expect(templateTab?.props).toEqual(
      expect.objectContaining({
        searchQuery: "template",
        templates: mocks.stitchTemplates.templates,
      }),
    );
  });

  it("filters the Stitches tab to posted stitches", () => {
    const { elements } = renderLibraryPage({
      stateValues: ["stitches", "", "posted", "active"],
    });
    const section = findByProp(elements, "statusFilter", "posted");

    expect(section?.props).toEqual(
      expect.objectContaining({
        hasMoreItems: true,
        statusCounts: {
          active: 1,
          all: 2,
          posted: 1,
        },
        onPostBridgeScheduled: mocks.library.refresh,
        stitches: expect.arrayContaining([
          expect.objectContaining({
            id: "posted_stitch_1",
          }),
        ]),
      }),
    );

    (section?.props?.onLoadMoreItems as () => void)();

    expect(mocks.library.loadMorePostedStitches).toHaveBeenCalledTimes(1);
    expect(mocks.library.loadMoreStitches).not.toHaveBeenCalled();
  });

  it("maps old Clips tab links to UGC", () => {
    const { elements } = renderLibraryPage({
      search: "?tab=clips",
    });
    const section = findByProp(elements, "id", "ugc-clips");

    expect(section?.props).toEqual(
      expect.objectContaining({
        clips: expect.arrayContaining([
          expect.objectContaining({
            id: "clipr_1",
          }),
        ]),
        title: "UGC",
      }),
    );
  });

  it("filters the Swipes tab to posted Swipes", () => {
    const { elements } = renderLibraryPage({
      stateValues: ["swipes", "", "active", "posted"],
    });
    const section = findByProp(elements, "statusFilter", "posted");

    expect(section?.props).toEqual(
      expect.objectContaining({
        statusCounts: {
          active: 1,
          all: 2,
          posted: 1,
        },
        statusFilter: "posted",
        onPostBridgeScheduled: mocks.swiprLibrary.refresh,
        swipes: [
          expect.objectContaining({
            id: "posted_swipe_1",
          }),
        ],
      }),
    );
  });

  it("renders UGC and swap tabs without upload controls", () => {
    mocks.useShowUploadControls.mockReturnValue(false);

    const ugc = renderLibraryPage({
      stateValues: ["ugc", "", "all", ""],
    }).elements;
    const swaps = renderLibraryPage({
      stateValues: ["swaps", "", "all", ""],
    }).elements;

    expect(findByProp(ugc, "id", "ugc-clips")?.props?.title).toBe("UGC");
    expect(findByProp(swaps, "id", "swaps")?.props?.title).toBe("Swaps");
    expect(
      ugc.some((element) => Array.isArray(element.props?.allowedAssetTypes)),
    ).toBe(false);
  });

  it("falls back to downstream errors when the clip library has none", () => {
    mocks.library = { ...mocks.library, error: null };
    mocks.swiprLibrary = { ...mocks.swiprLibrary, error: "Swipr error" };
    mocks.products = { ...mocks.products, error: "Product error" };
    mocks.useClipLibrary.mockReturnValue(mocks.library);
    mocks.useProducts.mockReturnValue(mocks.products);
    mocks.useSwiprLibrary.mockReturnValue(mocks.swiprLibrary);

    const { elements } = renderLibraryPage();

    expect(
      elements.some((element) =>
        String(element.props?.children).includes("Swipr error"),
      ),
    ).toBe(true);
  });
});
