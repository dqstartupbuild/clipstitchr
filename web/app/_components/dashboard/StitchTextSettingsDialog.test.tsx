import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StitchTextSettingsDialog } from "@/app/_components/dashboard/StitchTextSettingsDialog";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

const mocks = vi.hoisted(() => ({
  buttons: [] as Array<{
    children: React.ReactNode;
    isLoading?: boolean;
    onClick?: () => void;
  }>,
  clampTextOverlays: vi.fn(),
  getPlaybackRateDuration: vi.fn(),
  iconButtons: [] as Array<{ label: string; onClick?: () => void }>,
  setState: vi.fn(),
  stateQueue: [] as unknown[],
  textEditorProps: null as {
    activeTextOverlayId: string | null;
    currentTime: number;
    onActiveTextOverlayIdChange: (textOverlayId: string | null) => void;
    onChange: (textOverlays: TextOverlay[]) => void;
    textOverlays: TextOverlay[];
    totalDuration: number;
    ugcDuration: number;
  } | null,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : typeof initialValue === "function"
          ? (initialValue as () => unknown)()
          : initialValue;

      return [value, mocks.setState];
    },
  };
});

vi.mock("@/app/_components/stitchr/TextOverlayEditor", () => ({
  TextOverlayEditor: (props: NonNullable<typeof mocks.textEditorProps>) => {
    mocks.textEditorProps = props;
    return <div>TextOverlayEditor</div>;
  },
}));

vi.mock("@/app/_components/ui/Button", () => ({
  Button: ({
    children,
    isLoading,
    onClick,
  }: {
    children: React.ReactNode;
    isLoading?: boolean;
    onClick?: () => void;
  }) => {
    mocks.buttons.push({ children, isLoading, onClick });
    return (
      <button disabled={isLoading} type="button">
        {children}
      </button>
    );
  },
}));

vi.mock("@/app/_components/ui/IconButton", () => ({
  IconButton: (props: { label: string; onClick?: () => void }) => {
    mocks.iconButtons.push(props);
    return <button type="button">{props.label}</button>;
  },
}));

vi.mock("@/lib/clipstitchr/utils/clampTextOverlays", () => ({
  clampTextOverlays: mocks.clampTextOverlays,
}));

vi.mock("@/lib/clipstitchr/utils/getPlaybackRateDuration", () => ({
  getPlaybackRateDuration: mocks.getPlaybackRateDuration,
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

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 12,
    height: 1920,
    id: "stitch_1",
    name: "Launch stitch",
    textOverlay: createTextOverlay(),
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    ugcTrimRange: {
      end: 4,
      start: 1,
    },
    width: 1080,
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

async function flushPromises() {
  for (let index = 0; index < 3; index += 1) {
    await Promise.resolve();
  }
}

describe("StitchTextSettingsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buttons = [];
    mocks.getPlaybackRateDuration.mockReturnValue(3);
    mocks.iconButtons = [];
    mocks.setState.mockReset();
    mocks.stateQueue = [];
    mocks.textEditorProps = null;
    mocks.clampTextOverlays.mockImplementation((textOverlays: TextOverlay[]) =>
      textOverlays.map((textOverlay) => ({
        ...textOverlay,
        endTime: 12,
      })),
    );
  });

  it("renders the editor, closes from shell controls, and saves clamped text", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn(async () => undefined);
    const stopPropagation = vi.fn();
    const nextOverlay = createTextOverlay({ text: "Updated" });
    const tree = StitchTextSettingsDialog({
      error: "Text update failed.",
      isSaving: true,
      onClose,
      onSave,
      stitch: createStitch(),
    });
    const markup = renderToStaticMarkup(tree);
    const divs = findElements(tree, (element) => element.type === "div");

    mocks.textEditorProps?.onChange([nextOverlay]);
    mocks.iconButtons[0]?.onClick?.();
    (divs[0].props.onClick as () => void)();
    (divs[1].props.onClick as (event: { stopPropagation: () => void }) => void)(
      { stopPropagation },
    );
    mocks.buttons[0]?.onClick?.();
    await flushPromises();

    expect(markup).toContain("Launch stitch");
    expect(markup).toContain("Text update failed.");
    expect(mocks.getPlaybackRateDuration).toHaveBeenCalledWith(
      {
        end: 4,
        start: 1,
      },
      undefined,
    );
    expect(mocks.textEditorProps).toMatchObject({
      currentTime: 0,
      totalDuration: 12,
      ugcDuration: 3,
    });
    expect(mocks.setState).toHaveBeenCalledWith([nextOverlay]);
    expect(mocks.clampTextOverlays).toHaveBeenCalledWith(
      [createTextOverlay()],
      12,
    );
    expect(onSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          endTime: 12,
          text: "Launch today",
        }),
      ]),
    );
    expect(onClose).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect(mocks.buttons[0]?.isLoading).toBe(true);
  });

  it("saves null for blank text and uses zero UGC duration without a trim range", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn(async () => undefined);
    const blankOverlay = createTextOverlay({ text: "   " });

    renderToStaticMarkup(
      <StitchTextSettingsDialog
        error={null}
        isSaving={false}
        onClose={onClose}
        onSave={onSave}
        stitch={createStitch({
          textOverlay: blankOverlay,
          ugcTrimRange: undefined,
        })}
      />,
    );

    mocks.buttons[0]?.onClick?.();
    await flushPromises();

    expect(mocks.textEditorProps?.textOverlays).toEqual([blankOverlay]);
    expect(mocks.textEditorProps?.ugcDuration).toBe(0);
    expect(mocks.getPlaybackRateDuration).not.toHaveBeenCalled();
    expect(mocks.clampTextOverlays).toHaveBeenCalledWith([blankOverlay], 12);
    expect(onSave).toHaveBeenCalledWith(null);
    expect(onClose).toHaveBeenCalled();
  });

  it("leaves the dialog open when saving fails", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn(async () => {
      throw new Error("Save failed");
    });

    renderToStaticMarkup(
      <StitchTextSettingsDialog
        error={null}
        isSaving={false}
        onClose={onClose}
        onSave={onSave}
        stitch={createStitch()}
      />,
    );

    mocks.buttons[0]?.onClick?.();
    await flushPromises();

    expect(onSave).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
