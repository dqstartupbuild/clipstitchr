import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoadedStitchSequencePreview } from "@/app/_components/dashboard/LoadedStitchSequencePreview";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  sequence: {
    activeSegment: "ugc",
    currentTime: 2,
    demoVideoRef: { current: null },
    handleEnded: vi.fn(),
    handleLoadedMetadata: vi.fn(),
    handleTimeUpdate: vi.fn(),
    isPlaying: false,
    restart: vi.fn(),
    seekTo: vi.fn(),
    togglePlayback: vi.fn(),
    ugcVideoRef: { current: null },
  },
  setState: vi.fn(),
  useObjectUrl: vi.fn(),
  useSequenceVideoPlayer: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useMemo: (factory: () => unknown) => factory(),
    useRef: (initialValue: unknown) => ({ current: initialValue }),
    useState: (initialValue: unknown) => [initialValue, mocks.setState],
  };
});

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

vi.mock("@/lib/clipstitchr/hooks/useSequenceVideoPlayer", () => ({
  useSequenceVideoPlayer: mocks.useSequenceVideoPlayer,
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

function createClip(overrides: Partial<VideoClip> = {}): VideoClip {
  return {
    aspectRatio: 9 / 16,
    blob: new Blob(["clip"], { type: "video/mp4" }),
    clipType: "ugc",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "Clip",
    originalName: "clip.mp4",
    originalSize: 100,
    posterBlob: new Blob(["poster"], { type: "image/jpeg" }),
    size: 100,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "clip.mp4",
      size: 100,
    },
    width: 1080,
    ...overrides,
  };
}

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    demoTrimRange: { start: 1, end: 4 },
    duration: 6,
    height: 1920,
    id: "stitch_1",
    includeDemoAudio: false,
    includeUgcAudio: false,
    name: "Launch Stitch",
    textOverlay: {
      endTime: 4,
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
    ugcTrimRange: { start: 0.5, end: 3.5 },
    width: 1080,
    ...overrides,
  };
}

describe("LoadedStitchSequencePreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sequence = {
      activeSegment: "ugc",
      currentTime: 2,
      demoVideoRef: { current: null },
      handleEnded: vi.fn(),
      handleLoadedMetadata: vi.fn(),
      handleTimeUpdate: vi.fn(),
      isPlaying: false,
      restart: vi.fn(),
      seekTo: vi.fn(),
      togglePlayback: vi.fn(),
      ugcVideoRef: { current: null },
    };
    mocks.setState.mockReset();
    mocks.useObjectUrl.mockImplementation((blob: Blob | undefined) =>
      blob ? `blob:${blob.type}` : null,
    );
    mocks.useSequenceVideoPlayer.mockImplementation(() => mocks.sequence);
  });

  it("wires sequence video events, keyboard playback, controls, and seeking", () => {
    const tree = LoadedStitchSequencePreview({
      demoClip: createClip({
        clipType: "demo",
        duration: 5,
        id: "demo_1",
        name: "Demo",
      }),
      stitch: createStitch(),
      ugcClip: createClip({
        id: "ugc_1",
        name: "UGC",
      }),
    });
    const previewButton = findElements(
      tree,
      (element) => element.props?.role === "button",
    )[0];
    const videos = findElements(tree, (element) => element.type === "video");
    const iconButtons = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "IconButton",
    );
    const range = findElements(
      tree,
      (element) => element.type === "input" && element.props?.type === "range",
    )[0];
    const preventDefault = vi.fn();

    expect(previewButton.props["aria-label"]).toBe("Play stitch preview");
    expect(videos[0].props.muted).toBe(true);
    expect(videos[1].props.muted).toBe(true);
    expect(mocks.useSequenceVideoPlayer).toHaveBeenCalledWith({
      demoPlaybackRate: 1,
      demoTrimRange: { start: 1, end: 4 },
      ugcPlaybackRate: 1,
      ugcTrimRange: { start: 0.5, end: 3.5 },
    });

    (previewButton.props.onClick as () => void)();
    (previewButton.props.onKeyDown as (event: {
      key: string;
      preventDefault: () => void;
    }) => void)({ key: "Escape", preventDefault });
    (previewButton.props.onKeyDown as (event: {
      key: string;
      preventDefault: () => void;
    }) => void)({ key: "Enter", preventDefault });
    (previewButton.props.onKeyDown as (event: {
      key: string;
      preventDefault: () => void;
    }) => void)({ key: " ", preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(2);
    expect(mocks.sequence.togglePlayback).toHaveBeenCalledTimes(3);

    (videos[0].props.onEnded as () => void)();
    (videos[0].props.onLoadedMetadata as () => void)();
    (videos[0].props.onTimeUpdate as () => void)();
    (videos[1].props.onEnded as () => void)();
    (videos[1].props.onLoadedMetadata as () => void)();
    (videos[1].props.onTimeUpdate as () => void)();

    expect(mocks.sequence.handleEnded).toHaveBeenCalledWith("ugc");
    expect(mocks.sequence.handleEnded).toHaveBeenCalledWith("demo");
    expect(mocks.sequence.handleLoadedMetadata).toHaveBeenCalledWith("ugc");
    expect(mocks.sequence.handleLoadedMetadata).toHaveBeenCalledWith("demo");
    expect(mocks.sequence.handleTimeUpdate).toHaveBeenCalledWith("ugc");
    expect(mocks.sequence.handleTimeUpdate).toHaveBeenCalledWith("demo");

    (iconButtons[0].props.onClick as () => void)();
    (iconButtons[1].props.onClick as () => void)();
    expect(mocks.sequence.togglePlayback).toHaveBeenCalledTimes(4);
    expect(mocks.sequence.restart).toHaveBeenCalledOnce();

    (range.props.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "4.25" },
    });
    expect(mocks.sequence.seekTo).toHaveBeenCalledWith(4.25);
  });

  it("renders pause and unavailable states", () => {
    mocks.sequence = {
      ...mocks.sequence,
      activeSegment: "demo",
      currentTime: 12,
      isPlaying: true,
    };

    const playingMarkup = renderToStaticMarkup(
      <LoadedStitchSequencePreview
        demoClip={createClip({ clipType: "demo", id: "demo_1", name: "Demo" })}
        stitch={createStitch({ textOverlay: { ...createStitch().textOverlay!, text: "" } })}
        ugcClip={createClip({ id: "ugc_1", name: "UGC" })}
      />,
    );

    expect(playingMarkup).toContain("Pause stitch preview");

    mocks.useObjectUrl.mockReturnValue(null);

    expect(
      renderToStaticMarkup(
        <LoadedStitchSequencePreview
          demoClip={createClip({ clipType: "demo", id: "demo_1", name: "Demo" })}
          stitch={createStitch()}
          ugcClip={createClip({ id: "ugc_1", name: "UGC" })}
        />,
      ),
    ).toContain("Preview unavailable");
  });
});
