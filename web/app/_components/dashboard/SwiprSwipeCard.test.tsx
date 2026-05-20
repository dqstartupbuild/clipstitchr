import { beforeEach, describe, expect, it, vi } from "vitest";
import { SwiprSwipeCard } from "@/app/_components/dashboard/SwiprSwipeCard";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

const mocks = vi.hoisted(() => ({
  exporter: {
    error: null as string | null,
    exportCarousel: vi.fn(),
    progress: 0,
    status: "idle",
  },
  refValue: { current: null },
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  useObjectUrl: vi.fn(),
  useSwiprExport: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => effect(),
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

vi.mock("@/lib/clipstitchr/hooks/useSwiprExport", () => ({
  useSwiprExport: mocks.useSwiprExport,
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
    source: "seed",
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
    mocks.useObjectUrl.mockImplementation((blob: Blob | undefined) =>
      blob ? "blob:background" : null,
    );
    mocks.useSwiprExport.mockImplementation(() => mocks.exporter);
  });

  it("loads a background, exposes card actions, downloads, and deletes", async () => {
    const loadedBlob = new Blob(["background"], { type: "image/png" });
    const onDelete = vi.fn();
    const onLoadBackgroundBlob = vi.fn(async () => loadedBlob);

    mocks.stateQueue = [false, null, null];

    const tree = SwiprSwipeCard({
      background: createBackground(),
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
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith({
      blob: loadedBlob,
      id: "bg_1",
    });
    expect(actionItems.map((item) => item.label)).toEqual([
      "View Swipe details",
      "Download Swipe",
      "Edit Swipe",
      "Delete Swipe",
    ]);

    (previewButton.props.onClick as () => void)();
    actionItems[0].onClick?.();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(true);
    expect(actionItems[2].href).toBe("/dashboard/swipr?swipe=swipe_1");

    actionItems[1].onClick?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(onLoadBackgroundBlob).toHaveBeenCalledTimes(2);
    expect(mocks.exporter.exportCarousel).toHaveBeenCalledWith({
      background: {
        blob: loadedBlob,
        id: "bg_1",
        name: "Studio background",
        source: "seed",
      },
      productName: "Launch Kit",
      slides: createSwipe().slides,
    });

    actionItems[3].onClick?.();
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
    mocks.stateQueue = [
      true,
      null,
      {
        id: "bg_1",
        message: "Load failed",
      },
    ];

    const tree = SwiprSwipeCard({
      background: createBackground({ blob: backgroundBlob }),
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
    expect(mocks.useObjectUrl).toHaveBeenCalledWith(backgroundBlob);
  });

  it("stores load and download errors", async () => {
    const onLoadBackgroundBlob = vi
      .fn()
      .mockRejectedValueOnce(new Error("Load failed"))
      .mockRejectedValueOnce("Download failed");

    mocks.stateQueue = [false, null, null];

    const tree = SwiprSwipeCard({
      background: createBackground(),
      onDelete: vi.fn(),
      onLoadBackgroundBlob,
      swipe: createSwipe(),
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.setStateCalls[2]).toHaveBeenCalledWith({
      id: "bg_1",
      message: "Load failed",
    });

    getActionItems(tree)[1].onClick?.();
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.setStateCalls[2]).toHaveBeenCalledWith({
      id: "bg_1",
      message: "Unable to load this Swipe background.",
    });
  });
});
