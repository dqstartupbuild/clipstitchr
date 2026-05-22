import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LongrBuildResult } from "@/app/_components/longr/LongrBuildResult";
import { LongrMusicTimelineCard } from "@/app/_components/longr/LongrMusicTimelineCard";
import { LongrMusicTimelineStrip } from "@/app/_components/longr/LongrMusicTimelineStrip";
import { LongrPreviewPanel } from "@/app/_components/longr/LongrPreviewPanel";
import { LongrTimelineCard } from "@/app/_components/longr/LongrTimelineCard";
import { LongrTimelineStrip } from "@/app/_components/longr/LongrTimelineStrip";
import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => ({
  createVideoBlobWithPosterMetadata: vi.fn(),
  downloadBlob: vi.fn(),
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useEffect: (callback: () => void | (() => void)) => callback(),
    useMemo: (callback: () => unknown) => callback(),
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
  useObjectUrl: () => "blob:poster-url",
}));

vi.mock("@/lib/clipstitchr/hooks/useLazyBlobObjectUrl", () => ({
  useLazyBlobObjectUrl: () => "blob:lazy-poster-url",
}));

vi.mock("@/lib/clipstitchr/media/createVideoBlobWithPosterMetadata", () => ({
  createVideoBlobWithPosterMetadata: mocks.createVideoBlobWithPosterMetadata,
}));

vi.mock("@/lib/clipstitchr/utils/downloadBlob", () => ({
  downloadBlob: mocks.downloadBlob,
}));

vi.mock("@/app/_components/longr/LongrSequenceVideoPlayer", () => ({
  LongrSequenceVideoPlayer: ({
    clips,
  }: {
    clips: VideoClip[];
  }) => <div>Sequence player {clips.length}</div>,
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

function createLongrVideo(): LongrVideo {
  return {
    blob: new Blob(["video"], { type: "video/mp4" }),
    clipSegments: [],
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 64,
    height: 1920,
    id: "longr_1",
    longrObject: {
      contentType: "video/mp4",
      key: "users/user_123/longr/longr_1.mp4",
      size: 4567,
    },
    mimeType: "video/mp4",
    name: "Launch Long.mp4",
    posterBlob: new Blob(["poster"], { type: "image/jpeg" }),
    size: 4567,
    width: 1080,
  };
}

function createClip(id = "clip_1"): VideoClipMetadata {
  return {
    clipType: "ugc",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 12,
    height: 1920,
    id,
    mimeType: "video/mp4",
    name: "UGC clip",
    size: 100,
    updatedAt: "2026-05-20T00:00:00.000Z",
    width: 1080,
  } as VideoClipMetadata;
}

function createMusicClip(
  overrides: Partial<LongrMusicClip> = {},
): LongrMusicClip {
  return {
    durationSeconds: 30,
    id: "music_clip_1",
    sourceEndSeconds: 15,
    sourceStartSeconds: 0,
    timelineStartSeconds: 3,
    trackId: "track_1",
    trackTitle: "Bright Hook",
    volume: 0.5,
    ...overrides,
  };
}

describe("Longr components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createVideoBlobWithPosterMetadata.mockResolvedValue(
      new Blob(["download"], { type: "video/mp4" }),
    );
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
  });

  it("renders nothing without a build result and downloads completed Longs", async () => {
    expect(renderToStaticMarkup(<LongrBuildResult longrVideo={null} />)).toBe("");

    mocks.setStateCalls = [];
    mocks.stateQueue = [false, null];

    const tree = LongrBuildResult({
      longrVideo: createLongrVideo(),
    });
    const [button] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "Button",
    );

    (button.props.onClick as () => void)();
    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.createVideoBlobWithPosterMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Launch Long.mp4",
      }),
    );
    expect(mocks.downloadBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      "Launch Long.mp4",
    );
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(true);
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(false);
  });

  it("renders empty, loading, and loaded preview states", () => {
    mocks.stateQueue = [new Map()];
    expect(
      renderToStaticMarkup(
        <LongrPreviewPanel clips={[]} onLoadClip={async () => null} />,
      ),
    ).toContain("No clips selected");

    mocks.stateQueue = [new Map()];
    expect(
      renderToStaticMarkup(
        <LongrPreviewPanel clips={[createClip()]} onLoadClip={async () => null} />,
      ),
    ).toContain("Loading preview");

    const loadedClip = {
      ...createClip(),
      blob: new Blob(["video"], { type: "video/mp4" }),
    } as VideoClip;

    mocks.stateQueue = [new Map([["clip_1", loadedClip]])];
    expect(
      renderToStaticMarkup(
        <LongrPreviewPanel
          clips={[createClip()]}
          onLoadClip={async () => loadedClip}
        />,
      ),
    ).toContain("Sequence player 1");
  });

  it("routes timeline drag, drop, and remove interactions", () => {
    const onDragStart = vi.fn();
    const onDrop = vi.fn();
    const onRemove = vi.fn();
    const tree = LongrTimelineCard({
      clip: createClip(),
      index: 2,
      isDragging: true,
      onDragStart,
      onDrop,
      onLoadPoster: async () => new Blob(),
      onRemove,
    });
    const [card] = findElements(
      tree,
      (element) => element.type === "div" && element.props?.draggable === true,
    );
    const [removeButton] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "IconButton",
    );
    const preventDefault = vi.fn();

    (card.props.onDragStart as () => void)();
    (card.props.onDragOver as (event: { preventDefault: () => void }) => void)({
      preventDefault,
    });
    (card.props.onDrop as () => void)();
    (removeButton.props.onClick as () => void)();

    expect(onDragStart).toHaveBeenCalledWith("clip_1");
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(onDrop).toHaveBeenCalledWith("clip_1");
    expect(onRemove).toHaveBeenCalledWith("clip_1");
  });

  it("routes music timeline card edits and actions", () => {
    const onDuplicate = vi.fn();
    const onRemove = vi.fn();
    const onUpdate = vi.fn();
    const tree = LongrMusicTimelineCard({
      clip: createMusicClip(),
      onDuplicate,
      onRemove,
      onUpdate,
    });
    const iconButtons = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "IconButton",
    );
    const inputs = findElements(tree, (element) => element.type === "input");
    const markup = renderToStaticMarkup(tree);

    (iconButtons[0].props.onClick as () => void)();
    (iconButtons[1].props.onClick as () => void)();
    (inputs[0].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "4.5" } });
    (inputs[1].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "1.5" } });
    (inputs[2].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "16.5" } });
    (inputs[3].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "25" } });

    expect(markup).toContain("Bright Hook");
    expect(onDuplicate).toHaveBeenCalledWith("music_clip_1");
    expect(onRemove).toHaveBeenCalledWith("music_clip_1");
    expect(onUpdate).toHaveBeenCalledWith("music_clip_1", {
      timelineStartSeconds: 4.5,
    });
    expect(onUpdate).toHaveBeenCalledWith("music_clip_1", {
      sourceStartSeconds: 1.5,
    });
    expect(onUpdate).toHaveBeenCalledWith("music_clip_1", {
      sourceEndSeconds: 16.5,
    });
    expect(onUpdate).toHaveBeenCalledWith("music_clip_1", { volume: 0.25 });
  });

  it("renders music and video timeline strips", () => {
    const onMoveClip = vi.fn();
    const onRemoveClip = vi.fn();

    expect(
      renderToStaticMarkup(
        <LongrMusicTimelineStrip
          musicClips={[]}
          onDuplicate={vi.fn()}
          onRemove={vi.fn()}
          onUpdate={vi.fn()}
        />,
      ),
    ).toBe("");
    expect(
      renderToStaticMarkup(
        <LongrTimelineStrip
          clips={[]}
          onMoveClip={onMoveClip}
          onRemoveClip={onRemoveClip}
        />,
      ),
    ).toBe("");

    mocks.stateQueue = ["clip_1"];
    mocks.setStateCalls = [];

    const timelineTree = LongrTimelineStrip({
      clips: [createClip("clip_1"), createClip("clip_2")],
      onMoveClip,
      onRemoveClip,
    });
    const [firstTimelineCard] = findElements(
      timelineTree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "LongrTimelineCard",
    );
    const musicMarkup = renderToStaticMarkup(
      <LongrMusicTimelineStrip
        musicClips={[createMusicClip()]}
        onDuplicate={vi.fn()}
        onRemove={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );
    const timelineMarkup = renderToStaticMarkup(timelineTree);

    (firstTimelineCard.props.onDrop as (targetId: string) => void)("clip_2");

    expect(musicMarkup).toContain("Bright Hook");
    expect(timelineMarkup).toContain("Play order");
    expect(timelineMarkup).toContain("UGC clip");
    expect(onMoveClip).toHaveBeenCalledWith("clip_1", "clip_2");
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(null);
  });
});
