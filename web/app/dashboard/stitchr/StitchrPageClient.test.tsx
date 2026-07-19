import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StitchrPageClient } from "@/app/dashboard/stitchr/StitchrPageClient";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";
import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type ChildrenProps = {
  children?: unknown;
};

const mocks = vi.hoisted(() => ({
  clipLibraryState: {
    clips: [] as VideoClipMetadata[],
    error: null as string | null,
    isLoading: false,
    loadClip: vi.fn(),
    loadClipPoster: vi.fn(),
    loadStitch: vi.fn(),
    loadMoreClips: vi.fn(),
    refresh: vi.fn(),
    updateClipCuts: vi.fn(),
    videoGroups: {
      clipr: {
        clips: [] as VideoClipMetadata[],
        hasMoreItems: false,
        isLoadingMoreItems: false,
        loadMoreItems: vi.fn(),
      },
      demo: {
        clips: [] as VideoClipMetadata[],
        hasMoreItems: false,
        isLoadingMoreItems: false,
        loadMoreItems: vi.fn(),
      },
      swapr: {
        clips: [] as VideoClipMetadata[],
        hasMoreItems: false,
        isLoadingMoreItems: false,
        loadMoreItems: vi.fn(),
      },
      ugc: {
        clips: [] as VideoClipMetadata[],
        hasMoreItems: false,
        isLoadingMoreItems: false,
        loadMoreItems: vi.fn(),
      },
    },
  },
  loadedClipState: {
    clip: null,
    isLoading: false,
  },
  productState: {
    defaultProductId: undefined as string | undefined,
    error: null as string | null,
    products: [] as ProductProfile[],
  },
  stitchrState: {
    completedCount: 0,
    error: null,
    progress: 0,
    status: "idle",
    stitchLongrSequence: vi.fn(),
    stitchVideos: vi.fn(),
    stitches: [],
    totalCount: 0,
  },
  stitchTemplateState: {
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
  autoTextPanelProps: null as Record<string, unknown> | null,
  batchPanelProps: null as Record<string, unknown> | null,
  clipPickerPanelProps: null as Record<string, unknown> | null,
  generateStitchrBatch: vi.fn(),
  generateCliprText: vi.fn(),
  sequencePreviewPanelProps: null as Record<string, unknown> | null,
  socialCaptionPanelProps: null as Record<string, unknown> | null,
  stitchrHookPlansState: {
    accept: vi.fn(),
    attachStitch: vi.fn(),
    error: null as string | null,
    isLoading: false,
    plans: [] as StitchrHookPlan[],
    reject: vi.fn(),
    saveManualGeneration: vi.fn(),
    savingPlanId: null as string | null,
    selectOption: vi.fn(),
  },
  stateQueue: [] as unknown[],
  stateSetters: [] as ReturnType<typeof vi.fn>[],
  useEffect: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useEffect: mocks.useEffect,
    useMemo: (factory: () => unknown) => factory(),
    useRef: (initialValue: unknown) => ({ current: initialValue }),
    useState: (initialValue: unknown) => {
      const value =
        mocks.stateQueue.length > 0
          ? mocks.stateQueue.shift()
          : typeof initialValue === "function"
            ? (initialValue as () => unknown)()
            : initialValue;
      const setter = vi.fn((nextValue: unknown) => {
        if (typeof nextValue === "function") {
          return (nextValue as (currentValue: unknown) => unknown)(value);
        }

        return nextValue;
      });

      mocks.stateSetters.push(setter);

      return [value, setter];
    },
  };
});

vi.mock("@/app/_components/stitchr/StitchrShell", () => ({
  StitchrShell: ({ children }: ChildrenProps) => children,
}));

vi.mock("@/app/_components/stitchr/StitchrHeader", () => ({
  StitchrHeader: () => "StitchrHeader",
}));

vi.mock("@/app/_components/stitchr/ClipPickerPanel", () => ({
  ClipPickerPanel: (props: Record<string, unknown>) => {
    mocks.clipPickerPanelProps = props;
    return "ClipPickerPanel";
  },
}));

vi.mock("@/app/_components/stitchr/StitchrBatchPanel", () => ({
  StitchrBatchPanel: (props: Record<string, unknown>) => {
    mocks.batchPanelProps = props;
    return "StitchrBatchPanel";
  },
}));

vi.mock("@/app/_components/stitchr/StitchrAutoTextPanel", () => ({
  StitchrAutoTextPanel: (props: Record<string, unknown>) => {
    mocks.autoTextPanelProps = props;
    return "StitchrAutoTextPanel";
  },
}));

vi.mock("@/app/_components/stitchr/StitchrSocialCaptionPanel", () => ({
  StitchrSocialCaptionPanel: (props: Record<string, unknown>) => {
    mocks.socialCaptionPanelProps = props;
    return "StitchrSocialCaptionPanel";
  },
}));

vi.mock("@/app/_components/stitchr/StitchrProgressPanel", () => ({
  StitchrProgressPanel: () => "StitchrProgressPanel",
}));

vi.mock("@/app/_components/stitchr/DownloadStitchesPanel", () => ({
  DownloadStitchesPanel: () => "DownloadStitchesPanel",
}));

vi.mock("@/app/_components/stitchr/SequencePreviewPanel", () => ({
  SequencePreviewPanel: (props: Record<string, unknown>) => {
    mocks.sequencePreviewPanelProps = props;
    return "SequencePreviewPanel";
  },
}));

vi.mock("@/app/_components/stitchr/StitchrEmptyState", () => ({
  StitchrEmptyState: () => "StitchrEmptyState",
}));

vi.mock("@/lib/clipstitchr/hooks/useClipLibrary", () => ({
  useClipLibrary: () => mocks.clipLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useLoadedVideoClip", () => ({
  useLoadedVideoClip: () => mocks.loadedClipState,
}));

vi.mock("@/lib/clipstitchr/hooks/useProducts", () => ({
  useProducts: () => mocks.productState,
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => {
    const products = mocks.productState.products;
    const activeProduct =
      products.find(
        (product) => product.id === mocks.productState.defaultProductId,
      ) ?? products[0];

    return {
      activeProduct,
      activeProductId: activeProduct?.id,
      defaultProductId: mocks.productState.defaultProductId,
      error: mocks.productState.error,
      isBackfillingLegacyContent: false,
      isCreating: false,
      isLoading: false,
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

vi.mock("@/lib/clipstitchr/hooks/useStitchr", () => ({
  useStitchr: () => mocks.stitchrState,
}));

vi.mock("@/lib/clipstitchr/hooks/useStitchTemplates", () => ({
  useStitchTemplates: () => mocks.stitchTemplateState,
}));

vi.mock("@/lib/clipstitchr/hooks/useStitchrHookPlans", () => ({
  useStitchrHookPlans: () => mocks.stitchrHookPlansState,
}));

vi.mock("@/lib/clipstitchr/client/generateCliprText", () => ({
  generateCliprText: mocks.generateCliprText,
}));

vi.mock("@/lib/clipstitchr/client/generateStitchrBatch", () => ({
  generateStitchrBatch: mocks.generateStitchrBatch,
}));

function createClip(id: string, clipType: "ugc" | "demo"): VideoClipMetadata {
  return {
    aspectRatio: 9 / 16,
    clipType,
    createdAt: "2026-01-01T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    height: 1920,
    id,
    mimeType: "video/mp4",
    name: `${clipType} clip`,
    originalName: `${clipType}.mp4`,
    originalSize: 100,
    productId: clipType === "demo" ? "product_1" : undefined,
    size: 100,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-01-01T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: `users/user_1/video-clips/${id}/video.mp4`,
      size: 100,
    },
    width: 1080,
  };
}

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "A launch kit",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createVideoGroup(clips: VideoClipMetadata[] = []) {
  return {
    clips,
    postedClips: [],
    hasMoreItems: false,
    hasMorePostedItems: false,
    isLoadingMoreItems: false,
    isLoadingMorePostedItems: false,
    loadMoreItems: vi.fn(),
    loadMorePostedItems: vi.fn(),
  };
}

function setClipLibraryVideoGroups({
  clipr = [],
  demo = [createClip("demo_1", "demo")],
  swapr = [],
  ugc = [createClip("ugc_1", "ugc")],
}: {
  clipr?: VideoClipMetadata[];
  demo?: VideoClipMetadata[];
  swapr?: VideoClipMetadata[];
  ugc?: VideoClipMetadata[];
} = {}) {
  mocks.clipLibraryState.videoGroups = {
    clipr: createVideoGroup(clipr),
    demo: createVideoGroup(demo),
    swapr: createVideoGroup(swapr),
    ugc: createVideoGroup(ugc),
  };
}

function queueStitchrState(
  overrides: {
    activePreviewUgcId?: string;
    autoTextHookVariantContextKey?: string;
    autoTextHookPlanId?: string;
    autoTextSelectedHook?: string;
    autoTextHookVariants?: StitchrHookVariant[];
    autoTextMessage?: string | null;
    demoProductFilterId?: string;
    demoPlaybackRate?: 1 | 2;
    demoTrimRangesByClipId?: Record<string, { start: number; end: number }>;
    includeDemoAudio?: boolean;
    includeUgcAudio?: boolean;
    isGeneratingAutoText?: boolean;
    loadedLongrClipsById?: Record<string, unknown>;
    longrTextOverlays?: TextOverlay[];
    longrSocialCaption?: string;
    longrTimelineClipIds?: string[];
    mode?: "batch" | "normal" | "longr";
    appliedTemplateId?: string;
    batchTextBackgroundColorChoice?: AutomationStitchrColorChoice;
    batchTextColorChoice?: AutomationStitchrColorChoice;
    batchTextStrokeColorChoice?: AutomationStitchrColorChoice;
    batchTextStyleChoice?: AutomationStitchrTextStyleChoice;
    selectedDemoId?: string | null;
    selectedDemoIds?: string[];
    selectedMusicTrack?: SharedMusicTrack | null;
    selectedTemplateId?: string;
    selectedUgcIds?: string[];
    reusedSocialCaption?: string | null;
    reusedTextOverlays?: TextOverlay[] | null;
    socialCaptionByUgcId?: Record<string, string>;
    textOverlaysByUgcId?: Record<string, TextOverlay[]>;
    ugcPlaybackRate?: 1 | 2;
    ugcTrimRangesByClipId?: Record<string, { start: number; end: number }>;
  } = {},
) {
  mocks.stateQueue.push(
    overrides.mode ?? "normal",
    overrides.includeDemoAudio ?? false,
    overrides.includeUgcAudio ?? false,
    overrides.demoPlaybackRate ?? 1,
    overrides.ugcPlaybackRate ?? 1,
    overrides.selectedMusicTrack ?? null,
    overrides.selectedTemplateId ?? "",
    overrides.appliedTemplateId ?? "",
    overrides.batchTextStyleChoice ?? "any",
    overrides.batchTextColorChoice ?? "any",
    overrides.batchTextBackgroundColorChoice ?? "any",
    overrides.batchTextStrokeColorChoice ?? "any",
    overrides.textOverlaysByUgcId ?? {},
    overrides.reusedTextOverlays ?? null,
    overrides.longrTextOverlays ?? [],
    overrides.socialCaptionByUgcId ?? {},
    overrides.reusedSocialCaption ?? null,
    overrides.longrSocialCaption ?? "",
    overrides.demoProductFilterId,
    overrides.isGeneratingAutoText ?? false,
    overrides.autoTextMessage ?? null,
    {
      contextKey: overrides.autoTextHookVariantContextKey ?? "",
      hookPlanId: overrides.autoTextHookPlanId,
      hookVariants: overrides.autoTextHookVariants ?? [],
      selectedHook: overrides.autoTextSelectedHook ?? "",
    },
    overrides.ugcTrimRangesByClipId ?? {},
    overrides.demoTrimRangesByClipId ?? {},
    overrides.loadedLongrClipsById ?? {},
    [],
    [],
    overrides.selectedUgcIds ?? [],
    overrides.activePreviewUgcId,
    overrides.selectedDemoId,
    overrides.selectedDemoIds ?? [],
    overrides.longrTimelineClipIds ?? [],
    false,
    null,
  );
}

describe("StitchrPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      location: {
        href: "https://clipstitchr.test/dashboard/stitchr?mode=normal",
      },
      removeEventListener: vi.fn(),
    });
    mocks.clipLibraryState.clips = [];
    mocks.clipLibraryState.error = null;
    mocks.clipLibraryState.isLoading = false;
    mocks.clipLibraryState.loadClip.mockImplementation(async (id: string) =>
      createClip(id, id.startsWith("demo") ? "demo" : "ugc"),
    );
    mocks.clipLibraryState.loadStitch.mockResolvedValue(null);
    mocks.clipLibraryState.updateClipCuts.mockResolvedValue(undefined);
    setClipLibraryVideoGroups();
    mocks.productState.defaultProductId = undefined;
    mocks.productState.products = [createProduct()];
    mocks.stitchrHookPlansState.error = null;
    mocks.stitchrHookPlansState.isLoading = false;
    mocks.stitchrHookPlansState.plans = [];
    mocks.stitchrHookPlansState.savingPlanId = null;
    mocks.stitchrState.stitchLongrSequence.mockResolvedValue(undefined);
    mocks.stitchrState.stitchVideos.mockResolvedValue(undefined);
    mocks.generateCliprText.mockResolvedValue({
      caption: "Generated caption",
      hashtags: ["#launchkit", "#ugc", "#demo"],
      hook: "Generated hook",
      hookVariants: [
        {
          angle: "Clear pain",
          reason: "It matches the clip pair.",
          text: "Generated overlay",
        },
      ],
      overlayText: "Generated overlay",
      script: "",
      slides: ["Generated overlay"],
      socialCaption: "Generated caption\n\n#launchkit #ugc #demo",
    });
    mocks.stitchrHookPlansState.accept.mockResolvedValue(undefined);
    mocks.stitchrHookPlansState.attachStitch.mockResolvedValue(undefined);
    mocks.stitchrHookPlansState.reject.mockResolvedValue(undefined);
    mocks.stitchrHookPlansState.saveManualGeneration.mockResolvedValue("hook_plan_1");
    mocks.stitchrHookPlansState.selectOption.mockResolvedValue(undefined);
    mocks.generateStitchrBatch.mockResolvedValue({
      batchDate: "2026-06-17",
      count: 2,
      runId: "stitchr-batch:user_123:2026-06-17",
      status: "running",
      taskIds: ["task_1", "task_2"],
    });
    mocks.autoTextPanelProps = null;
    mocks.batchPanelProps = null;
    mocks.clipPickerPanelProps = null;
    mocks.sequencePreviewPanelProps = null;
    mocks.socialCaptionPanelProps = null;
    mocks.stateQueue.length = 0;
    mocks.stateSetters.length = 0;
    mocks.useEffect.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the plain Stitchr page in Batch mode by default", async () => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      location: {
        href: "https://clipstitchr.test/dashboard/stitchr",
      },
      removeEventListener: vi.fn(),
    });
    queueStitchrState({
      mode: "batch",
      selectedTemplateId: "template_1",
    });

    const markup = renderToStaticMarkup(<StitchrPageClient />);

    expect(markup).toContain("StitchrBatchPanel");
    expect(markup).not.toContain("ClipPickerPanel");
    expect(mocks.batchPanelProps).toEqual(
      expect.objectContaining({
        backgroundColorChoice: "any",
        batchSize: 10,
        isDisabled: false,
        mode: "batch",
        strokeColorChoice: "any",
        textColorChoice: "any",
        textStyleChoice: "any",
      }),
    );

    (mocks.batchPanelProps as { onGenerate: () => void }).onGenerate();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.generateStitchrBatch).toHaveBeenCalledTimes(1);
    expect(mocks.generateStitchrBatch).toHaveBeenCalledWith({
      productId: "product_1",
      soundTrackId: undefined,
      stitchrTextBackgroundColorChoice: "any",
      stitchrTextColorChoice: "any",
      stitchrTextStrokeColorChoice: "any",
      stitchrTextStyleChoice: "any",
      templateId: "template_1",
    });
    expect(
      mocks.stateSetters.some((setter) =>
        setter.mock.calls.some(
          ([value]) =>
            Array.isArray(value) && value.join("|") === "task_1|task_2",
        ),
      ),
    ).toBe(true);
  });

  it("passes selected Batch text styling into generation", async () => {
    queueStitchrState({
      batchTextBackgroundColorChoice: "#111111",
      batchTextColorChoice: "#f97316",
      batchTextStrokeColorChoice: "#ffffff",
      batchTextStyleChoice: "outline",
      mode: "batch",
    });

    renderToStaticMarkup(<StitchrPageClient />);

    expect(mocks.batchPanelProps).toEqual(
      expect.objectContaining({
        backgroundColorChoice: "#111111",
        strokeColorChoice: "#ffffff",
        textColorChoice: "#f97316",
        textStyleChoice: "outline",
      }),
    );

    (mocks.batchPanelProps as { onGenerate: () => void }).onGenerate();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.generateStitchrBatch).toHaveBeenCalledWith({
      productId: "product_1",
      soundTrackId: undefined,
      stitchrTextBackgroundColorChoice: "#111111",
      stitchrTextColorChoice: "#f97316",
      stitchrTextStrokeColorChoice: "#ffffff",
      stitchrTextStyleChoice: "outline",
      templateId: undefined,
    });
  });

  it("keeps saved batch hook options hidden until the current generation", async () => {
    const batchPlan = {
      createdAt: "2026-06-17T00:00:00.000Z",
      demoClipId: "demo_1",
      demoClipName: "Demo",
      hashtags: [],
      hookOptions: [
        {
          angle: "Pain",
          reason: "Matches the demo.",
          text: "Stop scrolling for this.",
        },
      ],
      id: "hook_plan_batch_1",
      productId: "product_1",
      productName: "Launch Kit",
      selectedHook: "Stop scrolling for this.",
      source: "batch_planner",
      status: "planned",
      ugcClipId: "ugc_1",
      ugcClipName: "UGC",
      updatedAt: "2026-06-17T00:00:00.000Z",
    } satisfies StitchrHookPlan;

    mocks.stitchrHookPlansState.plans = [batchPlan];
    queueStitchrState({ mode: "batch" });

    renderToStaticMarkup(<StitchrPageClient />);

    expect(mocks.batchPanelProps).toEqual(
      expect.objectContaining({
        hookPlans: [],
        savingHookPlanId: null,
      }),
    );

    (
      mocks.batchPanelProps as {
        onAcceptHookVariant: (planId: string, hookText: string) => void;
        onRejectHookVariant: (planId: string, hookText: string) => void;
        onSelectHookVariant: (planId: string, hookText: string) => void;
      }
    ).onSelectHookVariant("hook_plan_batch_1", "Stop scrolling for this.");
    (
      mocks.batchPanelProps as {
        onAcceptHookVariant: (planId: string, hookText: string) => void;
        onRejectHookVariant: (planId: string, hookText: string) => void;
        onSelectHookVariant: (planId: string, hookText: string) => void;
      }
    ).onAcceptHookVariant("hook_plan_batch_1", "Stop scrolling for this.");
    (
      mocks.batchPanelProps as {
        onAcceptHookVariant: (planId: string, hookText: string) => void;
        onRejectHookVariant: (planId: string, hookText: string) => void;
        onSelectHookVariant: (planId: string, hookText: string) => void;
      }
    ).onRejectHookVariant("hook_plan_batch_1", "Stop scrolling for this.");

    await Promise.resolve();

    expect(mocks.stitchrHookPlansState.selectOption).toHaveBeenCalledWith(
      "hook_plan_batch_1",
      "Stop scrolling for this.",
    );
    expect(mocks.stitchrHookPlansState.accept).toHaveBeenCalledWith(
      "hook_plan_batch_1",
      "Stop scrolling for this.",
    );
    expect(mocks.stitchrHookPlansState.reject).toHaveBeenCalledWith(
      "hook_plan_batch_1",
      "Stop scrolling for this.",
    );
  });

  it("renders the Stitchr build workspace from category-specific media groups", () => {
    const markup = renderToStaticMarkup(<StitchrPageClient />);

    expect(markup).toContain("StitchrHeader");
    expect(markup).toContain("ClipPickerPanel");
    expect(markup).toContain("StitchrAutoTextPanel");
    expect(markup).not.toContain("StitchrSocialCaptionPanel");
    expect(markup).toContain("StitchrProgressPanel");
    expect(markup).toContain("DownloadStitchesPanel");
    expect(markup).toContain("SequencePreviewPanel");
    expect(mocks.clipLibraryState.clips).toEqual([]);
    expect(
      (mocks.clipPickerPanelProps?.ugcClips as VideoClipMetadata[]).map(
        (clip) => clip.id,
      ),
    ).toEqual(["ugc_1"]);
    expect(
      (mocks.clipPickerPanelProps?.demoClips as VideoClipMetadata[]).map(
        (clip) => clip.id,
      ),
    ).toEqual(["demo_1"]);
    expect(mocks.clipPickerPanelProps?.selectedUgcIds).toEqual([]);
    expect(mocks.clipPickerPanelProps?.includeDemoAudio).toBe(false);
    expect(mocks.clipPickerPanelProps?.includeUgcAudio).toBe(false);
    expect(mocks.clipPickerPanelProps?.demoPlaybackRate).toBe(1);
    expect(mocks.clipPickerPanelProps?.ugcPlaybackRate).toBe(1);
    expect(mocks.clipPickerPanelProps?.canStitch).toBe(false);
  });

  it("uses the default product for demo filtering and auto-text", () => {
    mocks.productState.defaultProductId = "product_2";
    mocks.productState.products = [
      createProduct(),
      createProduct({
        id: "product_2",
        name: "Second Product",
      }),
    ];
    setClipLibraryVideoGroups({
      demo: [
        createClip("demo_1", "demo"),
        createClip("demo_2", "demo"),
      ].map((clip) =>
        clip.id === "demo_2" ? { ...clip, productId: "product_2" } : clip,
      ),
    });

    renderToStaticMarkup(<StitchrPageClient />);

    expect(mocks.clipPickerPanelProps?.demoProductFilterId).toBe("product_2");
    expect(
      (mocks.clipPickerPanelProps?.demoClips as VideoClipMetadata[]).map(
        (clip) => clip.id,
      ),
    ).toEqual(["demo_2"]);
    expect(mocks.autoTextPanelProps?.selectedProductId).toBe("product_2");
  });

  it("renders empty and error states", () => {
    setClipLibraryVideoGroups({ demo: [], ugc: [] });
    mocks.clipLibraryState.error = "Clip library unavailable.";

    const markup = renderToStaticMarkup(<StitchrPageClient />);

    expect(markup).toContain("Clip library unavailable.");
    expect(markup).toContain("StitchrEmptyState");
  });

  it("shows loading state instead of the upload prompt while groups are loading", () => {
    setClipLibraryVideoGroups({ demo: [], ugc: [] });
    mocks.clipLibraryState.isLoading = true;

    const markup = renderToStaticMarkup(<StitchrPageClient />);

    expect(markup).toContain("Loading Stitchr clips...");
    expect(markup).not.toContain("StitchrEmptyState");
  });

  it("includes Clipr and Swapr clips as reusable UGC inputs", () => {
    setClipLibraryVideoGroups({
      clipr: [createClip("clipr_1", "ugc")],
      demo: [createClip("demo_1", "demo")],
      swapr: [createClip("swapr_1", "ugc")],
      ugc: [],
    });

    renderToStaticMarkup(<StitchrPageClient />);

    expect(
      (mocks.clipPickerPanelProps?.ugcClips as VideoClipMetadata[]).map(
        (clip) => clip.id,
      ),
    ).toEqual(["clipr_1", "swapr_1"]);
  });

  it("loads more clips from the Stitchr category groups", () => {
    const ugcLoadMore = mocks.clipLibraryState.videoGroups.ugc.loadMoreItems;
    const cliprLoadMore = mocks.clipLibraryState.videoGroups.clipr.loadMoreItems;
    const swaprLoadMore = mocks.clipLibraryState.videoGroups.swapr.loadMoreItems;
    const demoLoadMore = mocks.clipLibraryState.videoGroups.demo.loadMoreItems;

    mocks.clipLibraryState.videoGroups.ugc.hasMoreItems = true;
    mocks.clipLibraryState.videoGroups.clipr.hasMoreItems = false;
    mocks.clipLibraryState.videoGroups.swapr.hasMoreItems = true;
    mocks.clipLibraryState.videoGroups.demo.hasMoreItems = true;
    renderToStaticMarkup(<StitchrPageClient />);

    const clipPickerProps = mocks.clipPickerPanelProps as {
      hasMoreClips: boolean;
      onLoadMoreClips: () => void;
    };

    expect(clipPickerProps.hasMoreClips).toBe(true);
    clipPickerProps.onLoadMoreClips();

    expect(ugcLoadMore).toHaveBeenCalledTimes(1);
    expect(cliprLoadMore).not.toHaveBeenCalled();
    expect(swaprLoadMore).toHaveBeenCalledTimes(1);
    expect(demoLoadMore).toHaveBeenCalledTimes(1);
    expect(mocks.clipLibraryState.loadMoreClips).not.toHaveBeenCalled();
  });

  it("exercises Stitchr selection, trim, music, stitch, and auto-text callbacks", async () => {
    queueStitchrState({
      activePreviewUgcId: "ugc_1",
      selectedUgcIds: ["ugc_1"],
    });
    renderToStaticMarkup(<StitchrPageClient />);

    const clipPickerProps = mocks.clipPickerPanelProps as {
      onAddMusicChange: (checked: boolean) => void;
      onDemoProductFilterChange: (productId: string) => void;
      onIncludeDemoAudioChange: (checked: boolean) => void;
      onIncludeUgcAudioChange: (checked: boolean) => void;
      onSelectDemo: (id: string) => void;
      onSelectMusicTrack: (track: SharedMusicTrack) => void;
      onSelectUgc: (id: string) => void;
      onStitch: () => void;
      onUpdateDemoTrim: (
        clip: VideoClipMetadata,
        trimRange: { start: number; end: number },
      ) => void;
      onUpdateDemoCuts: (
        clip: VideoClipMetadata,
        removeRanges: { start: number; end: number; reason?: string }[],
      ) => Promise<void>;
      onUpdateUgcTrim: (
        clip: VideoClipMetadata,
        trimRange: { start: number; end: number },
      ) => void;
      onUpdateUgcCuts: (
        clip: VideoClipMetadata,
        removeRanges: { start: number; end: number; reason?: string }[],
      ) => Promise<void>;
    };
    const autoTextProps = mocks.autoTextPanelProps as {
      onGenerate: () => void;
      onProductChange: (productId: string) => void;
    };
    const sequencePreviewProps = mocks.sequencePreviewPanelProps as {
      onActiveUgcChange: (id: string) => void;
      onCopyTextOverlayToAll: () => void;
      onTextOverlaysChange: (textOverlays: TextOverlay[]) => void;
    };
    const ugcClip = mocks.clipLibraryState.videoGroups.ugc.clips[0];
    const demoClip = mocks.clipLibraryState.videoGroups.demo.clips[0];

    clipPickerProps.onSelectUgc(ugcClip.id);
    clipPickerProps.onSelectDemo(demoClip.id);
    clipPickerProps.onUpdateUgcTrim(ugcClip, { start: -3, end: 20 });
    clipPickerProps.onUpdateDemoTrim(demoClip, { start: 1, end: 3 });
    await clipPickerProps.onUpdateUgcCuts(ugcClip, [
      { start: 2, end: 4, reason: "Pause" },
    ]);
    await clipPickerProps.onUpdateDemoCuts(demoClip, [
      { start: 3, end: 5, reason: "Loading" },
    ]);
    clipPickerProps.onIncludeDemoAudioChange(false);
    clipPickerProps.onIncludeUgcAudioChange(false);
    clipPickerProps.onSelectMusicTrack({
      audioObject: {
        contentType: "audio/mpeg",
        key: "music.mp3",
        size: 100,
      },
      createdAt: "2026-05-20T00:00:00.000Z",
      durationSeconds: 30,
      id: "music_1",
      isOwnedByCurrentUser: false,
      mimeType: "audio/mpeg",
      size: 100,
      source: "library",
      tags: ["upbeat"],
      title: "Music",
      uploadedByOwnerId: "user_1",
    });
    clipPickerProps.onDemoProductFilterChange("product_1");
    sequencePreviewProps.onActiveUgcChange(ugcClip.id);
    sequencePreviewProps.onCopyTextOverlayToAll();
    sequencePreviewProps.onTextOverlaysChange([
      {
        backgroundColor: "#000000",
        color: "#ffffff",
        endTime: 3,
        fontSize: 48,
        startTime: 0,
        styleId: "hook",
        text: "Hook",
        width: 0.8,
        x: 0.5,
        y: 0.5,
      },
    ]);
    autoTextProps.onProductChange("product_1");
    autoTextProps.onGenerate();
    clipPickerProps.onStitch();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.clipLibraryState.updateClipCuts).toHaveBeenCalledWith(ugcClip, [
      { start: 2, end: 4, reason: "Pause" },
    ]);
    expect(mocks.clipLibraryState.updateClipCuts).toHaveBeenCalledWith(demoClip, [
      { start: 3, end: 5, reason: "Loading" },
    ]);
    expect(mocks.generateCliprText).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "product_1",
        purpose: "stitchr",
        stitchrClipContexts: [
          expect.objectContaining({
            id: "ugc_1",
            role: "ugc",
          }),
          expect.objectContaining({
            id: "demo_1",
            role: "demo",
          }),
        ],
      }),
    );
    expect(mocks.stitchrState.stitchVideos).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          clip: expect.objectContaining({ id: "ugc_1" }),
          socialCaption: "",
        }),
      ]),
      expect.objectContaining({ id: "demo_1" }),
      expect.any(Object),
      null,
      expect.objectContaining({
        demoPlaybackRate: 1,
          includeDemoAudio: false,
          includeUgcAudio: false,
          ugcPlaybackRate: 1,
        }),
    );
  });

  it("syncs selected clips from URL changes and cleans up the listener", () => {
    let cleanup: (() => void) | undefined;
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    mocks.useEffect.mockImplementationOnce((effect: () => void | (() => void)) => {
      cleanup = effect() ?? undefined;
    });
    vi.stubGlobal("window", {
      addEventListener,
      location: {
        href: "https://clipstitchr.test/dashboard/stitchr?ugcId=ugc_1&demoId=demo_1",
      },
      removeEventListener,
    });

    renderToStaticMarkup(<StitchrPageClient />);
    cleanup?.();

    expect(mocks.useEffect.mock.calls[0]?.[1]).toEqual([]);
    expect(addEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );

    vi.unstubAllGlobals();
  });

  it("prefills Stitchr from a reusable stitch template URL", async () => {
    let cleanup: (() => void) | undefined;
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const textOverlay = {
      backgroundColor: "#000000",
      color: "#ffffff",
      endTime: 3,
      fontSize: 48,
      startTime: 0,
      styleId: "hook",
      text: "Reuse hook",
      width: 0.8,
      x: 0.5,
      y: 0.5,
    } satisfies TextOverlay;

    mocks.clipLibraryState.loadStitch.mockResolvedValueOnce({
      createdAt: "2026-05-20T00:00:00.000Z",
      demoClipId: "demo_2",
      demoClipName: "Demo 2",
      demoPlaybackRate: 2,
      demoTrimRange: { end: 6, start: 1 },
      duration: 10,
      height: 1920,
      id: "template_1",
      includeDemoAudio: true,
      includeUgcAudio: true,
      mode: "normal",
      name: "Reusable stitch",
      socialCaption: "Reuse this caption\n\n#ugc #demo #launch",
      textOverlays: [textOverlay],
      ugcClipId: "ugc_2",
      ugcClipName: "UGC 2",
      ugcPlaybackRate: 1,
      ugcTrimRange: { end: 4, start: 0 },
      width: 1080,
    });
    mocks.useEffect.mockImplementationOnce((effect: () => void | (() => void)) => {
      cleanup = effect() ?? undefined;
    });
    vi.stubGlobal("window", {
      addEventListener,
      location: {
        href: "https://clipstitchr.test/dashboard/stitchr?templateStitchId=template_1",
      },
      removeEventListener,
    });

    renderToStaticMarkup(<StitchrPageClient />);

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }
    cleanup?.();

    expect(mocks.clipLibraryState.loadStitch).toHaveBeenCalledWith(
      "template_1",
    );
    expect(mocks.clipLibraryState.loadClip).toHaveBeenCalledWith("ugc_2");
    expect(mocks.clipLibraryState.loadClip).toHaveBeenCalledWith("demo_2");
    expect(mocks.stateSetters[27]).toHaveBeenCalledWith(["ugc_2"]);
    expect(mocks.stateSetters[28]).toHaveBeenCalledWith("ugc_2");
    expect(mocks.stateSetters[29]).toHaveBeenCalledWith("demo_2");
    expect(mocks.stateSetters[30]).toHaveBeenCalledWith(["demo_2"]);
    expect(mocks.stateSetters[31]).toHaveBeenCalledWith(["ugc_2", "demo_2"]);
    expect(mocks.stateSetters[12]).toHaveBeenCalledWith({});
    expect(mocks.stateSetters[13]).toHaveBeenCalledWith([textOverlay]);
    expect(mocks.stateSetters[15]).toHaveBeenCalledWith({});
    expect(mocks.stateSetters[16]).toHaveBeenCalledWith(
      "Reuse this caption\n\n#ugc #demo #launch",
    );

    vi.unstubAllGlobals();
  });

  it("covers UGC and demo selection edge paths", () => {
    setClipLibraryVideoGroups({
      demo: [createClip("demo_1", "demo")],
      ugc: [createClip("ugc_1", "ugc"), createClip("ugc_2", "ugc")],
    });
    renderToStaticMarkup(<StitchrPageClient />);

    const clipPickerProps = mocks.clipPickerPanelProps as {
      onDemoProductFilterChange: (productId: string) => void;
      onSelectDemo: (id: string) => void;
      onSelectUgc: (id: string) => void;
    };

    clipPickerProps.onSelectUgc("missing_ugc");
    clipPickerProps.onSelectUgc("ugc_1");
    clipPickerProps.onSelectUgc("ugc_2");
    clipPickerProps.onSelectDemo("missing_demo");
    clipPickerProps.onSelectDemo("demo_1");
    clipPickerProps.onDemoProductFilterChange("unknown_product");

    expect(mocks.stateSetters.length).toBeGreaterThan(0);
  });

  it("generates auto-text guard messages and provider errors", async () => {
    mocks.productState.products = [];
    renderToStaticMarkup(<StitchrPageClient />);
    (mocks.autoTextPanelProps as { onGenerate: () => void }).onGenerate();

    mocks.productState.products = [createProduct()];
    setClipLibraryVideoGroups({
      demo: [
        createClip("demo_1", "demo"),
      ].map((clip) => ({
        ...clip,
        duration: 0,
      })),
      ugc: [
        createClip("ugc_1", "ugc"),
      ].map((clip) => ({
        ...clip,
        duration: 0,
      })),
    });
    renderToStaticMarkup(<StitchrPageClient />);
    (mocks.autoTextPanelProps as { onGenerate: () => void }).onGenerate();

    setClipLibraryVideoGroups();
    mocks.generateCliprText.mockRejectedValueOnce(new Error("text failed"));
    queueStitchrState({
      activePreviewUgcId: "ugc_1",
      selectedUgcIds: ["ugc_1"],
    });
    renderToStaticMarkup(<StitchrPageClient />);
    (mocks.autoTextPanelProps as { onGenerate: () => void }).onGenerate();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.generateCliprText).toHaveBeenCalled();
  });

  it("passes text overlays and music options into stitching", () => {
    const musicTrack = {
      audioObject: {
        contentType: "audio/mpeg",
        key: "music.mp3",
        size: 100,
      },
      createdAt: "2026-05-20T00:00:00.000Z",
      durationSeconds: 30,
      id: "music_1",
      isOwnedByCurrentUser: false,
      mimeType: "audio/mpeg",
      size: 100,
      source: "library",
      tags: ["upbeat"],
      title: "Music",
      uploadedByOwnerId: "user_1",
    } satisfies SharedMusicTrack;
    const textOverlay = {
      backgroundColor: "#000000",
      color: "#ffffff",
      endTime: 3,
      fontSize: 48,
      startTime: 0,
      styleId: "hook",
      text: "Hook",
      width: 0.8,
      x: 0.5,
      y: 0.5,
    } satisfies TextOverlay;

    queueStitchrState({
      includeDemoAudio: false,
      includeUgcAudio: false,
      activePreviewUgcId: "ugc_1",
      selectedMusicTrack: musicTrack,
      selectedUgcIds: ["ugc_1"],
      textOverlaysByUgcId: {
        ugc_1: [textOverlay],
      },
    });
    renderToStaticMarkup(<StitchrPageClient />);

    (mocks.clipPickerPanelProps as { onStitch: () => void }).onStitch();

    expect(mocks.stitchrState.stitchVideos).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          textOverlays: expect.arrayContaining([
            expect.objectContaining({
              backgroundColor: textOverlay.backgroundColor,
              text: textOverlay.text,
            }),
          ]),
        }),
      ]),
      expect.objectContaining({ id: "demo_1" }),
      expect.any(Object),
      null,
      expect.objectContaining({
        demoPlaybackRate: 1,
        includeDemoAudio: false,
        includeUgcAudio: false,
        musicTrack,
        ugcPlaybackRate: 1,
      }),
    );
  });

  it("links the visible normal hook plan after creating a stitch", async () => {
    mocks.stitchrState.stitchVideos.mockResolvedValueOnce([
      {
        createdAt: "2026-06-17T00:00:00.000Z",
        demoClipId: "demo_1",
        demoClipName: "Demo",
        duration: 16,
        height: 1920,
        id: "stitch_1",
        name: "UGC + Demo",
        ugcClipId: "ugc_1",
        ugcClipName: "UGC",
        width: 1080,
      },
    ]);
    mocks.stitchrHookPlansState.plans = [
      {
        createdAt: "2026-06-17T00:00:00.000Z",
        demoClipId: "demo_1",
        demoClipName: "Demo",
        hashtags: [],
        hookOptions: [
          {
            angle: "Pain",
            reason: "Matches the demo.",
            text: "Stop scrolling for this.",
          },
        ],
        id: "hook_plan_1",
        productId: "product_1",
        productName: "Launch Kit",
        selectedHook: "Stop scrolling for this.",
        source: "manual",
        status: "planned",
        ugcClipId: "ugc_1",
        ugcClipName: "UGC",
        updatedAt: "2026-06-17T00:00:00.000Z",
      },
    ];
    queueStitchrState({
      activePreviewUgcId: "ugc_1",
      autoTextHookPlanId: "hook_plan_1",
      autoTextHookVariantContextKey: "ugc_1|demo_1",
      autoTextHookVariants: [
        {
          angle: "Pain",
          reason: "Matches the demo.",
          text: "Stop scrolling for this.",
        },
      ],
      autoTextSelectedHook: "Stop scrolling for this.",
      selectedUgcIds: ["ugc_1"],
    });

    renderToStaticMarkup(<StitchrPageClient />);

    (mocks.clipPickerPanelProps as { onStitch: () => void }).onStitch();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.stitchrHookPlansState.attachStitch).toHaveBeenCalledWith(
      "hook_plan_1",
      "stitch_1",
    );
  });

  it("uses reused template text for UGC without its own overlay", () => {
    const textOverlay = {
      backgroundColor: "#000000",
      color: "#ffffff",
      endTime: 3,
      fontSize: 48,
      startTime: 0,
      styleId: "hook",
      text: "Reuse hook",
      width: 0.8,
      x: 0.5,
      y: 0.5,
    } satisfies TextOverlay;

    setClipLibraryVideoGroups({
      demo: [createClip("demo_1", "demo")],
      ugc: [createClip("ugc_new", "ugc")],
    });
    queueStitchrState({
      activePreviewUgcId: "ugc_new",
      reusedSocialCaption: "Reuse caption\n\n#ugc #demo #launch",
      reusedTextOverlays: [textOverlay],
      selectedUgcIds: ["ugc_new"],
    });
    renderToStaticMarkup(<StitchrPageClient />);

    (mocks.clipPickerPanelProps as { onStitch: () => void }).onStitch();

    expect(mocks.stitchrState.stitchVideos).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          clip: expect.objectContaining({ id: "ugc_new" }),
          socialCaption: "Reuse caption\n\n#ugc #demo #launch",
          textOverlays: [
            expect.objectContaining({
              backgroundColor: textOverlay.backgroundColor,
              text: textOverlay.text,
            }),
          ],
        }),
      ],
      expect.objectContaining({ id: "demo_1" }),
      expect.any(Object),
      null,
      expect.any(Object),
    );
  });
});
