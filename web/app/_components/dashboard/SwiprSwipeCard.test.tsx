import { beforeEach, describe, expect, it, vi } from "vitest";
import { SwiprSwipeCard } from "@/app/_components/dashboard/SwiprSwipeCard";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import type { SocialPublishingPostReference } from "@/lib/clipstitchr/types/SocialPublishingPostReference";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

const mocks = vi.hoisted(() => ({
  exporter: {
    error: null as string | null,
    exportCarousel: vi.fn(),
    progress: 0,
    status: "idle",
  },
  lazyObjectUrlOptions: null as null | { loadBlob: () => Promise<Blob | null> },
  lazyPosterUrl: null as string | null,
  refValue: { current: null },
  scheduleProps: null as null | {
    defaultCaption?: string;
    onScheduled: (post: SocialPublishingPostReference) => void;
    sourceTitle?: string;
  },
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  useObjectUrl: vi.fn(),
  useSwiprExport: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useEffect: (effect: () => void | (() => void)) => effect(),
    useMemo: (factory: () => unknown) => factory(),
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : typeof initialValue === "function"
          ? (initialValue as () => unknown)()
          : initialValue;
      const setState = vi.fn();

      mocks.setStateCalls.push(setState);

      return [value, setState];
    },
  };
});

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

vi.mock("@/lib/clipstitchr/hooks/useLazyBlobObjectUrl", () => ({
  useLazyBlobObjectUrl: (options: { loadBlob: () => Promise<Blob | null> }) => {
    mocks.lazyObjectUrlOptions = options;
    return mocks.lazyPosterUrl;
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprExport", () => ({
  useSwiprExport: mocks.useSwiprExport,
}));

vi.mock("@/app/_components/socialPublishing/SocialPublishingScheduleDialog", () => ({
  SocialPublishingScheduleDialog: (props: {
    defaultCaption?: string;
    onScheduled: (post: SocialPublishingPostReference) => void;
    sourceTitle?: string;
  }) => {
    mocks.scheduleProps = props;
    return "SocialPublishingScheduleDialog";
  },
}));

function findElements(
  value: unknown,
  predicate: (element: {
    props?: Record<string, unknown>;
    type?: unknown;
  }) => boolean,
): Array<{ props: Record<string, unknown>; type?: unknown }> {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((child) => findElements(child, predicate));
  }

  const element = value as {
    props?: { children?: unknown };
    type?: unknown;
  };
  const matches = predicate(
    element as { props?: Record<string, unknown>; type?: unknown },
  )
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [...matches, ...findElements(element.props?.children, predicate)];
}

function createBackground(
  overrides: Partial<SwiprBackgroundAsset> = {},
): SwiprBackgroundAsset {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    height: 1920,
    id: "bg_1",
    imageObject: {
      contentType: "image/png",
      key: "background.png",
      size: 100,
    },
    mimeType: "image/png",
    name: "Studio background",
    size: 100,
    source: "upload",
    tags: ["studio"],
    width: 1080,
    ...overrides,
  };
}

function createSwipe(overrides: Partial<SwiprSwipe> = {}): SwiprSwipe {
  return {
    backgroundId: "bg_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "swipe_1",
    name: "Launch Swipe",
    productContext: "Launch context",
    productName: "Launch Kit",
    productSourceId: "product_1",
    productSourceType: "saved-product",
    slides: [
      {
        id: "slide_1",
        textOverlay: {
          endTime: 1,
          fontSize: 48,
          startTime: 0,
          styleId: "hook",
          text: "Launch now",
          width: 0.8,
          x: 0.1,
          y: 0.2,
        },
      },
    ],
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

function createSocialPublishingPostReference(): SocialPublishingPostReference {
  return {
    createdAt: "2026-06-28T12:00:00.000Z",
    hasAudio: true,
    mediaIds: ["media_1"],
    mediaKind: "video",
    platforms: ["instagram"],
    postId: "post_1",
    socialAccountIds: ["account_123"],
    sourceType: "swipe",
    status: "scheduled",
    updatedAt: "2026-06-28T12:00:00.000Z",
  };
}

function getActionItems(tree: unknown): MediaCardActionMenuItem[] {
  return findElements(
    tree,
    (element) =>
      typeof element.type === "function" &&
      element.type.name === "MediaCardActionMenu",
  )[0].props.items as MediaCardActionMenuItem[];
}

describe("SwiprSwipeCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.exporter = {
      error: null,
      exportCarousel: vi.fn(async () => undefined),
      progress: 0,
      status: "idle",
    };
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    mocks.lazyObjectUrlOptions = null;
    mocks.lazyPosterUrl = null;
    mocks.scheduleProps = null;
    mocks.useObjectUrl.mockImplementation((blob: Blob | undefined) =>
      blob ? "blob:background" : null,
    );
    mocks.useSwiprExport.mockImplementation(() => mocks.exporter);
  });

  it("loads a background, exposes card actions, downloads, and deletes", async () => {
    const loadedBlob = new Blob(["background"], { type: "image/png" });
    const onDelete = vi.fn();
    const onLoadBackgroundBlob = vi.fn(async () => loadedBlob);

    mocks.stateQueue = [false, false, null, null, null];

    const tree = SwiprSwipeCard({
      background: createBackground(),
      backgrounds: [createBackground()],
      onDelete,
      onLoadBackgroundBlob,
      swipe: createSwipe(),
    });
    const previewButton = findElements(
      tree,
      (element) =>
        element.type === "button" &&
        String(element.props?.["aria-label"]).startsWith("Open details"),
    )[0];
    const actionItems = getActionItems(tree);

    await Promise.resolve();

    expect(onLoadBackgroundBlob).toHaveBeenCalledWith("bg_1");
    expect(mocks.setStateCalls[3]).toHaveBeenCalledWith({
      blob: loadedBlob,
      id: "bg_1",
    });
    expect(actionItems.map((item) => item.label)).toEqual([
      "View Swipe details",
      "Download Swipe",
      "Schedule post",
      "Edit Swipe",
      "Delete Swipe",
    ]);

    (previewButton.props.onClick as () => void)();
    actionItems[0].onClick?.();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(true);
    expect(actionItems[3].href).toBe(
      "/dashboard/swipr?mode=edit&swipe=swipe_1",
    );

    actionItems[1].onClick?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(onLoadBackgroundBlob).toHaveBeenCalledTimes(2);
    expect(mocks.exporter.exportCarousel).toHaveBeenCalledWith(
      expect.objectContaining({
        background: {
          blob: loadedBlob,
          id: "bg_1",
          name: "Studio background",
          source: "upload",
        },
        productName: "Launch Kit",
        slideBackgrounds: expect.objectContaining({
          slide_1: expect.objectContaining({ id: "bg_1" }),
        }),
        slides: createSwipe().slides,
      }),
    );

    actionItems[4].onClick?.();
    expect(onDelete).toHaveBeenCalledWith("swipe_1");
  });

  it("renders disabled download, details props, and background errors", () => {
    const backgroundBlob = new Blob(["background"], { type: "image/png" });

    mocks.exporter = {
      error: "Export failed",
      exportCarousel: vi.fn(),
      progress: 0.5,
      status: "rendering",
    };
    mocks.stateQueue = [true, false, null, null, null];

    const tree = SwiprSwipeCard({
      background: createBackground({ blob: backgroundBlob }),
      backgrounds: [createBackground({ blob: backgroundBlob })],
      onDelete: vi.fn(),
      onLoadBackgroundBlob: vi.fn(),
      swipe: createSwipe(),
    });
    const actionItems = getActionItems(tree);
    const details = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "SwiprSwipeDetailsDialog",
    )[0];

    expect(actionItems[1].disabled).toBe(true);
    expect(details.props.isDownloading).toBe(true);
    expect(details.props.background).toMatchObject({
      blob: backgroundBlob,
      id: "bg_1",
    });
    expect(details.props.editHref).toBe(
      "/dashboard/swipr?mode=edit&swipe=swipe_1",
    );
    expect(mocks.useObjectUrl).toHaveBeenCalledWith(backgroundBlob);
  });

  it("shows saved caption and hashtag copy on the card", () => {
    const tree = SwiprSwipeCard({
      background: createBackground({ blob: new Blob(["background"]) }),
      backgrounds: [createBackground()],
      onDelete: vi.fn(),
      onLoadBackgroundBlob: vi.fn(),
      swipe: createSwipe({
        caption: "The faster way to plan a launch.",
        hashtags: ["#launch", "#founders"],
      }),
    });
    const markup = JSON.stringify(tree);

    expect(markup).toContain("The faster way to plan a launch.");
    expect(markup).toContain("#launch #founders");
  });

  it("shows missing-background Swipes with edit and delete actions", () => {
    const onLoadBackgroundBlob = vi.fn();

    mocks.stateQueue = [false, false, null, null, null];

    const tree = SwiprSwipeCard({
      backgrounds: [],
      onDelete: vi.fn(),
      onLoadBackgroundBlob,
      swipe: createSwipe(),
    });
    const markup = JSON.stringify(tree);
    const actionItems = getActionItems(tree);

    expect(onLoadBackgroundBlob).not.toHaveBeenCalled();
    expect(markup).toContain("Photo is missing");
    expect(markup).toContain("Edit or delete this Swipe.");
    expect(markup).toContain("A photo for this Swipe was deleted.");
    expect(actionItems.find((item) => item.label === "Download Swipe")?.disabled).toBe(true);
    expect(actionItems.find((item) => item.label === "Edit Swipe")?.href).toBe(
      "/dashboard/swipr?mode=edit&swipe=swipe_1",
    );
    expect(actionItems.some((item) => item.label === "Delete Swipe")).toBe(true);
  });

  it("stores load and download errors", async () => {
    const onLoadBackgroundBlob = vi
      .fn()
      .mockRejectedValueOnce(new Error("Load failed"))
      .mockRejectedValueOnce("Download failed");

    mocks.stateQueue = [false, false, null, null, null];

    const tree = SwiprSwipeCard({
      background: createBackground(),
      backgrounds: [createBackground()],
      onDelete: vi.fn(),
      onLoadBackgroundBlob,
      swipe: createSwipe(),
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.setStateCalls[4]).toHaveBeenCalledWith({
      id: "bg_1",
      message: "Load failed",
    });

    getActionItems(tree)[1].onClick?.();
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.setStateCalls[4]).toHaveBeenCalledWith({
      id: "bg_1",
      message: "Unable to load this Swipe background.",
    });
  });

  it("marks Swipes as posted and active", async () => {
    const onUpdatePostedStatus = vi.fn(async () => undefined);

    mocks.stateQueue = [false, false, null, null, null];

    const activeTree = SwiprSwipeCard({
      background: createBackground({ blob: new Blob(["background"]) }),
      backgrounds: [createBackground()],
      onDelete: vi.fn(),
      onLoadBackgroundBlob: vi.fn(),
      onUpdatePostedStatus,
      swipe: createSwipe(),
    });

    getActionItems(activeTree)
      .find((item) => item.label === "Mark as posted")
      ?.onClick?.();
    await Promise.resolve();

    expect(onUpdatePostedStatus).toHaveBeenCalledWith(createSwipe(), true);

    const postedSwipe = createSwipe({ isPosted: true });
    const postedTree = SwiprSwipeCard({
      background: createBackground({ blob: new Blob(["background"]) }),
      backgrounds: [createBackground()],
      onDelete: vi.fn(),
      onLoadBackgroundBlob: vi.fn(),
      onUpdatePostedStatus,
      swipe: postedSwipe,
    });

    getActionItems(postedTree)
      .find((item) => item.label === "Mark as active")
      ?.onClick?.();
    await Promise.resolve();

    expect(onUpdatePostedStatus).toHaveBeenCalledWith(postedSwipe, false);
  });

  it("marks the card posted and refreshes after Zernio scheduling", () => {
    const onSocialPublishingScheduled = vi.fn();

    mocks.stateQueue = [false, true, false, null, null, null, false];

    const tree = SwiprSwipeCard({
      background: createBackground({ blob: new Blob(["background"]) }),
      backgrounds: [createBackground()],
      onDelete: vi.fn(),
      onLoadBackgroundBlob: vi.fn(),
      onSocialPublishingScheduled,
      swipe: createSwipe(),
    });
    const scheduleDialog = findElements(
      tree,
      (element) =>
        element.props?.sourceType === "swipe" &&
        typeof element.props?.onScheduled === "function",
    )[0];

    (scheduleDialog.props.onScheduled as (post: SocialPublishingPostReference) => void)(
      createSocialPublishingPostReference(),
    );

    expect(onSocialPublishingScheduled).toHaveBeenCalledTimes(1);
    expect(mocks.setStateCalls.at(-1)).toHaveBeenCalledWith(true);
  });

  it("uses the first Swipe post copy line as the Zernio title", () => {
    mocks.stateQueue = [false, true, false, null, null, null, false];

    const tree = SwiprSwipeCard({
      background: createBackground({ blob: new Blob(["background"]) }),
      backgrounds: [createBackground()],
      onDelete: vi.fn(),
      onLoadBackgroundBlob: vi.fn(),
      swipe: createSwipe({
        description:
          "The gym usually is not the answer.\n\nHere is what fixes it.",
        name: "Guppy carousel",
        socialCaption:
          "Skinny-fat is solvable. The gym just usually isn't the solution.\n\nThe gym usually is not the answer.",
      }),
    });
    const scheduleDialog = findElements(
      tree,
      (element) =>
        element.props?.sourceType === "swipe" &&
        typeof element.props?.onScheduled === "function",
    )[0];

    expect(scheduleDialog.props.defaultCaption).toBe(
      "Skinny-fat is solvable. The gym just usually isn't the solution.\n\nThe gym usually is not the answer.",
    );
    expect(scheduleDialog.props.sourceTitle).toBe(
      "Skinny-fat is solvable. The gym just usually isn't the solution.",
    );
  });
});
