import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SequencePreviewPanel } from "@/app/_components/stitchr/SequencePreviewPanel";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

const mocks = vi.hoisted(() => ({
  getVideoTrimRangeDuration: vi.fn(),
  navigatorProps: null as {
    activeIndex: number;
    activeName: string;
    onNext: () => void;
    onPrevious: () => void;
    onSelectIndex: (index: number) => void;
    totalCount: number;
  } | null,
  playerProps: null as {
    onPlaybackTimeChange: (time: number) => void;
    onTextOverlayChange: (textOverlay: TextOverlay) => void;
    totalDuration: number;
  } | null,
  setState: vi.fn(),
  stateQueue: [] as unknown[],
  swipeOptions: null as {
    isEnabled: boolean;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
  } | null,
  textEditorProps: null as {
    canCopyToAll: boolean;
    currentTime: number;
    onChange: (textOverlay: TextOverlay | null) => void;
    onCopyToAll?: () => void;
    totalDuration: number;
    ugcDuration: number;
  } | null,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useMemo: (factory: () => unknown) => factory(),
    useState: (initialValue: unknown) => [
      mocks.stateQueue.length ? mocks.stateQueue.shift() : initialValue,
      mocks.setState,
    ],
  };
});

vi.mock("@/app/_components/stitchr/SequencePreviewNavigator", () => ({
  SequencePreviewNavigator: (props: NonNullable<typeof mocks.navigatorProps>) => {
    mocks.navigatorProps = props;
    return <div>Navigator:{props.activeName}</div>;
  },
}));

vi.mock("@/app/_components/stitchr/SequenceVideoPlayer", () => ({
  SequenceVideoPlayer: (props: NonNullable<typeof mocks.playerProps>) => {
    mocks.playerProps = props;
    return <div>Player:{props.totalDuration}</div>;
  },
}));

vi.mock("@/app/_components/stitchr/TextOverlayEditor", () => ({
  TextOverlayEditor: (props: NonNullable<typeof mocks.textEditorProps>) => {
    mocks.textEditorProps = props;
    return <div>Text editor</div>;
  },
}));

vi.mock("@/app/_components/ui/Panel", () => ({
  Panel: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
}));

vi.mock("@/lib/clipstitchr/hooks/useHorizontalSwipeNavigation", () => ({
  useHorizontalSwipeNavigation: (options: NonNullable<typeof mocks.swipeOptions>) => {
    mocks.swipeOptions = options;
    return {
      onPointerDown: vi.fn(),
    };
  },
}));

vi.mock("@/lib/clipstitchr/utils/getVideoTrimRangeDuration", () => ({
  getVideoTrimRangeDuration: mocks.getVideoTrimRangeDuration,
}));

function createTextOverlay(overrides: Partial<TextOverlay> = {}): TextOverlay {
  return {
    endTime: 4,
    fontSize: 48,
    startTime: 0,
    styleId: "hook",
    text: "Launch today",
    width: 80,
    x: 10,
    y: 20,
    ...overrides,
  };
}

function createClip(id: string, name: string): VideoClip {
  return {
    blob: new Blob(["video"], { type: "video/mp4" }),
    duration: 8,
    height: 1920,
    id,
    name,
    width: 1080,
  } as VideoClip;
}

function createClipMetadata(id: string, name: string): VideoClipMetadata {
  return {
    duration: 8,
    height: 1920,
    id,
    name,
    updatedAt: "2026-05-20T00:00:00.000Z",
    width: 1080,
  } as VideoClipMetadata;
}

const ugcTrimRange: VideoTrimRange = {
  end: 6,
  start: 1,
};
const demoTrimRange: VideoTrimRange = {
  end: 4,
  start: 0,
};

describe("SequencePreviewPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getVideoTrimRangeDuration
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(4);
    mocks.navigatorProps = null;
    mocks.playerProps = null;
    mocks.setState.mockReset();
    mocks.stateQueue = [];
    mocks.swipeOptions = null;
    mocks.textEditorProps = null;
  });

  it("renders a loaded preview and wires navigation, swipe, and overlay callbacks", () => {
    const onActiveUgcChange = vi.fn();
    const onCopyTextOverlayToAll = vi.fn();
    const onTextOverlayChange = vi.fn();
    const overlay = createTextOverlay();
    const tree = SequencePreviewPanel({
      activeUgcId: "ugc_2",
      demoClip: createClip("demo_1", "Demo clip"),
      demoPlaybackRate: 1,
      demoTrimRange,
      includeDemoAudio: true,
      includeUgcAudio: false,
      canCopyTextOverlayToAll: true,
      onActiveUgcChange,
      onCopyTextOverlayToAll,
      onTextOverlayChange,
      previewUgcClips: [
        createClipMetadata("ugc_1", "First UGC"),
        createClipMetadata("ugc_2", "Second UGC"),
      ],
      textOverlay: overlay,
      ugcClip: createClip("ugc_2", "Loaded UGC"),
      ugcPlaybackRate: 1,
      ugcTrimRange,
    });
    const markup = renderToStaticMarkup(tree);

    mocks.navigatorProps?.onPrevious();
    mocks.navigatorProps?.onNext();
    mocks.navigatorProps?.onSelectIndex(0);
    mocks.navigatorProps?.onSelectIndex(99);
    mocks.swipeOptions?.onSwipeLeft();
    mocks.swipeOptions?.onSwipeRight();
    mocks.playerProps?.onTextOverlayChange(createTextOverlay({ text: "Next" }));
    mocks.playerProps?.onPlaybackTimeChange(2.5);
    mocks.textEditorProps?.onCopyToAll?.();
    mocks.textEditorProps?.onChange(null);

    expect(markup).toContain("Navigator:Second UGC");
    expect(markup).toContain("Player:9");
    expect(mocks.navigatorProps).toMatchObject({
      activeIndex: 1,
      activeName: "Second UGC",
      totalCount: 2,
    });
    expect(mocks.swipeOptions?.isEnabled).toBe(true);
    expect(onActiveUgcChange).toHaveBeenCalledWith("ugc_1");
    expect(onTextOverlayChange).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Next" }),
    );
    expect(onTextOverlayChange).toHaveBeenCalledWith(null);
    expect(onCopyTextOverlayToAll).toHaveBeenCalledTimes(1);
    expect(mocks.setState).toHaveBeenCalledWith(2.5);
    expect(mocks.textEditorProps).toMatchObject({
      canCopyToAll: true,
      currentTime: 0,
      totalDuration: 9,
      ugcDuration: 5,
    });
  });

  it("falls back to an empty prompt and disables navigation for incomplete previews", () => {
    const emptyMarkup = renderToStaticMarkup(
      <SequencePreviewPanel
        activeUgcId={null}
        demoClip={null}
        demoPlaybackRate={1}
        demoTrimRange={null}
        includeDemoAudio={false}
        includeUgcAudio={false}
        onActiveUgcChange={vi.fn()}
        onTextOverlayChange={vi.fn()}
        previewUgcClips={[]}
        textOverlay={null}
        ugcClip={null}
        ugcPlaybackRate={1}
        ugcTrimRange={null}
      />,
    );

    expect(emptyMarkup).toContain("Select UGC and a product demo");
    expect(mocks.navigatorProps).toBeNull();
    expect(mocks.swipeOptions).toMatchObject({ isEnabled: false });

    mocks.swipeOptions = null;
    mocks.getVideoTrimRangeDuration
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(4);
    const onActiveUgcChange = vi.fn();
    renderToStaticMarkup(
      <SequencePreviewPanel
        activeUgcId="missing"
        demoClip={createClip("demo_1", "Demo clip")}
        demoPlaybackRate={1}
        demoTrimRange={demoTrimRange}
        includeDemoAudio={false}
        includeUgcAudio={false}
        onActiveUgcChange={onActiveUgcChange}
        onTextOverlayChange={vi.fn()}
        previewUgcClips={[createClipMetadata("ugc_1", "First UGC")]}
        textOverlay={null}
        ugcClip={createClip("ugc_1", "Loaded UGC")}
        ugcPlaybackRate={1}
        ugcTrimRange={ugcTrimRange}
      />,
    );

    mocks.navigatorProps?.onPrevious();
    mocks.navigatorProps?.onNext();

    expect(mocks.navigatorProps).toMatchObject({
      activeIndex: 0,
      activeName: "First UGC",
      totalCount: 1,
    });
    expect(mocks.swipeOptions).toMatchObject({ isEnabled: false });
    expect(onActiveUgcChange).not.toHaveBeenCalled();
  });
});
