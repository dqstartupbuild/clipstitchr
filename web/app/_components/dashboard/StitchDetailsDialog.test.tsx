import { describe, expect, it, vi } from "vitest";
import { StitchDetailsDialog } from "@/app/_components/dashboard/StitchDetailsDialog";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

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

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    demoTrimRange: { end: 5, start: 1 },
    duration: 9,
    height: 1920,
    id: "stitch_1",
    includeDemoAudio: true,
    includeUgcAudio: true,
    isPosted: false,
    name: "Launch Stitch",
    size: 2048,
    textOverlay: {
      endTime: 5,
      fontSize: 36,
      startTime: 1,
      styleId: "hook",
      text: "Launch now",
      width: 0.8,
      x: 0.1,
      y: 0.2,
    },
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    ugcTrimRange: { end: 4, start: 0 },
    width: 1080,
    ...overrides,
  };
}

describe("StitchDetailsDialog", () => {
  it("shows the saved caption and hashtags in the detail view", () => {
    const socialCaption = "That demo changed the whole vibe\n\n#ugc #demo #win";
    const tree = StitchDetailsDialog({
      demoClip: null,
      isLoadingPreview: false,
      onClose: vi.fn(),
      onLoadPreview: vi.fn(),
      posterUrl: "poster.jpg",
      previewError: null,
      stitch: createStitch({ socialCaption }),
      ugcClip: null,
    });
    const captionLabel = findElements(
      tree,
      (element) =>
        element.type === "p" &&
        element.props?.children === "Caption and hashtags",
    )[0];
    const captionText = findElements(
      tree,
      (element) =>
        element.type === "p" && element.props?.children === socialCaption,
    )[0];

    expect(captionLabel).toBeDefined();
    expect(captionText).toBeDefined();
    expect(captionText.props.className).toContain("whitespace-pre-wrap");
  });

  it("shows a copy button for the saved caption and hashtags", () => {
    const socialCaption = "That demo changed the whole vibe\n\n#ugc #demo #win";
    const tree = StitchDetailsDialog({
      demoClip: null,
      isLoadingPreview: false,
      onClose: vi.fn(),
      onLoadPreview: vi.fn(),
      posterUrl: "poster.jpg",
      previewError: null,
      stitch: createStitch({ socialCaption }),
      ugcClip: null,
    });
    const copyButton = findElements(
      tree,
      (element) =>
        element.props?.socialCaption === socialCaption &&
        element.props?.variant === "icon",
    )[0];

    expect(copyButton).toBeDefined();
  });

  it("keeps long stitch metadata inside the mobile dialog width", () => {
    const longToken = "stitch-output-" + "x".repeat(180);
    const onClose = vi.fn();
    const stopPropagation = vi.fn();
    const tree = StitchDetailsDialog({
      demoClip: null,
      isLoadingPreview: false,
      onClose,
      onLoadPreview: vi.fn(),
      posterUrl: "poster.jpg",
      previewError: longToken,
      stitch: createStitch({
        demoClipName: longToken,
        name: longToken,
        ugcClipName: longToken,
      }),
      ugcClip: null,
    });
    const root = findElements(
      tree,
      (element) =>
        element.type === "div" &&
        String(element.props?.className).includes("fixed inset-0"),
    )[0];
    const dialog = findElements(
      tree,
      (element) => element.props?.role === "dialog",
    )[0];
    const contentGrid = findElements(
      tree,
      (element) =>
        element.type === "div" &&
        String(element.props?.className).includes("grid min-w-0"),
    )[0];
    const titleText = findElements(
      tree,
      (element) =>
        element.type === "p" &&
        element.props?.children === longToken &&
        String(element.props?.className).includes("text-text-primary"),
    )[0];
    const detailText = findElements(
      tree,
      (element) =>
        element.type === "p" &&
        String(element.props?.className).includes("leading-6") &&
        String(element.props?.children).includes(longToken),
    )[0];

    (root.props.onClick as () => void)();
    (dialog.props.onClick as (event: { stopPropagation: () => void }) => void)({
      stopPropagation,
    });

    expect(onClose).toHaveBeenCalledOnce();
    expect(stopPropagation).toHaveBeenCalledOnce();
    expect(dialog.props.className).toContain("overflow-x-hidden");
    expect(dialog.props.className).toContain("max-w-[calc(100vw-1rem)]");
    expect(contentGrid.props.className).toContain("max-w-full");
    expect(titleText.props.className).toContain("break-words");
    expect(detailText.props.className).toContain("[overflow-wrap:anywhere]");
  });
});
