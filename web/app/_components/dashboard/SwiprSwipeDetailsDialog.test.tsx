import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SwiprSwipeDetailsDialog } from "@/app/_components/dashboard/SwiprSwipeDetailsDialog";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

const mocks = vi.hoisted(() => ({
  buttons: [] as Array<{
    children: React.ReactNode;
    disabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
  }>,
  iconButtons: [] as Array<{
    disabled?: boolean;
    label: string;
    onClick?: () => void;
  }>,
  overlayProps: null as { textOverlay: TextOverlay } | null,
  setState: vi.fn(),
  stateQueue: [] as unknown[],
  swipeNavigationOptions: null as {
    isEnabled: boolean;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
  } | null,
  useObjectUrl: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useState: (initialValue: unknown) => [
      mocks.stateQueue.length ? mocks.stateQueue.shift() : initialValue,
      mocks.setState,
    ],
  };
});

vi.mock("@/app/_components/swipr/SwiprStaticTextOverlayBox", () => ({
  SwiprStaticTextOverlayBox: (props: { textOverlay: TextOverlay }) => {
    mocks.overlayProps = props;
    return <div>{props.textOverlay.text}</div>;
  },
}));

vi.mock("@/app/_components/ui/Button", () => ({
  Button: ({
    children,
    disabled,
    isLoading,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
  }) => {
    mocks.buttons.push({ children, disabled, isLoading, onClick });
    return (
      <button disabled={disabled || isLoading} type="button">
        {children}
      </button>
    );
  },
}));

vi.mock("@/app/_components/ui/IconButton", () => ({
  IconButton: (props: {
    disabled?: boolean;
    label: string;
    onClick?: () => void;
  }) => {
    mocks.iconButtons.push(props);
    return (
      <button disabled={props.disabled} type="button">
        {props.label}
      </button>
    );
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useHorizontalSwipeNavigation", () => ({
  useHorizontalSwipeNavigation: (options: {
    isEnabled: boolean;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
  }) => {
    mocks.swipeNavigationOptions = options;
    return {
      onPointerDown: vi.fn(),
    };
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

function createTextOverlay(overrides: Partial<TextOverlay> = {}): TextOverlay {
  return {
    endTime: 5,
    fontSize: 48,
    startTime: 0,
    styleId: "hook",
    text: "Launch today",
    width: 70,
    x: 15,
    y: 30,
    ...overrides,
  };
}

function createBackground(
  overrides: Partial<SwiprBackgroundAsset> = {},
): SwiprBackgroundAsset {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    height: 1920,
    id: "background_1",
    imageObject: {
      contentType: "image/jpeg",
      key: "background.jpg",
      size: 100,
    },
    mimeType: "image/jpeg",
    name: "Studio",
    size: 100,
    source: "upload",
    tags: ["studio"],
    width: 1080,
    ...overrides,
  };
}

function createSwipe(overrides: Partial<SwiprSwipe> = {}): SwiprSwipe {
  return {
    backgroundId: "background_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "swipe_1",
    name: "Launch carousel",
    productContext: "Landing page offer",
    productName: "Launch Kit",
    productSourceId: "product_1",
    productSourceType: "saved-product",
    slides: [
      {
        id: "slide_1",
        textOverlay: createTextOverlay(),
      },
      {
        id: "slide_2",
        textOverlay: createTextOverlay({ text: "Second slide" }),
      },
    ],
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

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

describe("SwiprSwipeDetailsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buttons = [];
    mocks.iconButtons = [];
    mocks.overlayProps = null;
    mocks.stateQueue = [];
    mocks.swipeNavigationOptions = null;
    mocks.useObjectUrl.mockReturnValue("blob:background");
  });

  it("renders multi-slide details and wires carousel, swipe, close, download, edit, and delete actions", () => {
    const onClose = vi.fn();
    const onDelete = vi.fn();
    const onDownload = vi.fn();
    const onEdit = vi.fn();
    const stopPropagation = vi.fn();
    const tree = SwiprSwipeDetailsDialog({
      background: createBackground({
        blob: new Blob(["background"], { type: "image/jpeg" }),
      }),
      isDownloading: true,
      onClose,
      onDelete,
      onDownload,
      onEdit,
      swipe: createSwipe(),
    });
    const markup = renderToStaticMarkup(tree);
    const divs = findElements(tree, (element) => element.type === "div");

    (divs[0].props.onClick as () => void)();
    (divs[1].props.onClick as (event: { stopPropagation: () => void }) => void)(
      { stopPropagation },
    );
    mocks.iconButtons
      .find((button) => button.label === "Previous carousel image")
      ?.onClick?.();
    mocks.iconButtons
      .find((button) => button.label === "Next carousel image")
      ?.onClick?.();
    mocks.swipeNavigationOptions?.onSwipeLeft();
    mocks.swipeNavigationOptions?.onSwipeRight();
    mocks.buttons[0]?.onClick?.();
    mocks.buttons[1]?.onClick?.();
    mocks.buttons[2]?.onClick?.();

    const stateUpdaters = mocks.setState.mock.calls.map(
      ([updater]) => updater as (currentIndex: number) => number,
    );

    expect(markup).toContain("Launch carousel");
    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("Image 1 of 2");
    expect(markup).toContain("blob:background");
    expect(mocks.overlayProps?.textOverlay.text).toBe("Launch today");
    expect(mocks.swipeNavigationOptions?.isEnabled).toBe(true);
    expect(stateUpdaters.map((updater) => updater(0))).toEqual([1, 1, 1, 1]);
    expect(stateUpdaters.map((updater) => updater(1))).toEqual([0, 0, 0, 0]);
    expect(stopPropagation).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onDownload).toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
    expect(mocks.buttons[0]?.isLoading).toBe(true);
  });

  it("disables carousel actions when a single slide has no preview image or text", () => {
    mocks.useObjectUrl.mockReturnValue(null);
    const tree = SwiprSwipeDetailsDialog({
      background: createBackground(),
      isDownloading: false,
      onClose: vi.fn(),
      onDelete: vi.fn(),
      onDownload: vi.fn(),
      onEdit: vi.fn(),
      swipe: createSwipe({
        slides: [
          {
            id: "slide_1",
            textOverlay: createTextOverlay({ text: "   " }),
          },
        ],
      }),
    });
    const markup = renderToStaticMarkup(tree);

    expect(markup).toContain("Image 1 of 1");
    expect(markup).not.toContain("blob:background");
    expect(mocks.overlayProps).toBeNull();
    expect(mocks.swipeNavigationOptions?.isEnabled).toBe(false);
    expect(
      mocks.iconButtons.find(
        (button) => button.label === "Previous carousel image",
      )?.disabled,
    ).toBe(true);
    expect(
      mocks.iconButtons.find(
        (button) => button.label === "Next carousel image",
      )?.disabled,
    ).toBe(true);
  });
});
