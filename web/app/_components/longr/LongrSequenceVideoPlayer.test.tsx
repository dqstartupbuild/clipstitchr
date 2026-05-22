import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LongrSequenceVideoLayer } from "@/app/_components/longr/LongrSequenceVideoLayer";
import { LongrSequenceVideoPlayer } from "@/app/_components/longr/LongrSequenceVideoPlayer";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  handleEnded: vi.fn(),
  handleLoadedMetadata: vi.fn(),
  handleTimeUpdate: vi.fn(),
  objectUrls: [] as Array<string | null>,
  restart: vi.fn(),
  seekTo: vi.fn(),
  setVideoRef: vi.fn(),
  togglePlayback: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/hooks/useLongrSequenceVideoPlayer", () => ({
  useLongrSequenceVideoPlayer: () => ({
    activeIndex: 1,
    currentTime: 8,
    handleEnded: mocks.handleEnded,
    handleLoadedMetadata: mocks.handleLoadedMetadata,
    handleTimeUpdate: mocks.handleTimeUpdate,
    isPlaying: true,
    restart: mocks.restart,
    seekTo: mocks.seekTo,
    setVideoRef: mocks.setVideoRef,
    togglePlayback: mocks.togglePlayback,
    totalDuration: 20,
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: () =>
    mocks.objectUrls.length ? mocks.objectUrls.shift() : "blob:media-url",
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

function createClip(id: string): VideoClip {
  return {
    blob: new Blob(["video"], { type: "video/mp4" }),
    clipType: "ugc",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 10,
    height: 1920,
    hasAudio: true,
    id,
    aspectRatio: 1080 / 1920,
    mimeType: "video/mp4",
    name: `Clip ${id}`,
    originalName: `Clip ${id}.mp4`,
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: `users/user_123/clips/${id}.mp4`,
      size: 100,
    },
    width: 1080,
  };
}

describe("LongrSequenceVideoPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.objectUrls = [];
  });

  it("renders unavailable state when no clips are provided", () => {
    expect(
      renderToStaticMarkup(
        <LongrSequenceVideoPlayer clips={[]} trimRanges={[]} />,
      ),
    ).toContain("Preview unavailable");
  });

  it("wires layer callbacks, playback buttons, and timeline seeking", () => {
    const tree = LongrSequenceVideoPlayer({
      clips: [createClip("clip_1"), createClip("clip_2")],
      trimRanges: [
        { start: 0, end: 10 },
        { start: 0, end: 10 },
      ],
    });
    const layers = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "LongrSequenceVideoLayer",
    );
    const iconButtons = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "IconButton",
    );
    const [range] = findElements(
      tree,
      (element) => element.type === "input" && element.props?.type === "range",
    );

    (layers[1].props.videoRef as (video: HTMLVideoElement | null) => void)(
      {} as HTMLVideoElement,
    );
    (layers[1].props.onEnded as () => void)();
    (layers[1].props.onLoadedMetadata as () => void)();
    (layers[1].props.onTimeUpdate as () => void)();
    (iconButtons[0].props.onClick as () => void)();
    (iconButtons[1].props.onClick as () => void)();
    (range.props.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "13.5" },
    });

    expect(layers[0].props.isActive).toBe(false);
    expect(layers[1].props.isActive).toBe(true);
    expect(mocks.setVideoRef).toHaveBeenCalledWith(1, {});
    expect(mocks.handleEnded).toHaveBeenCalledWith(1);
    expect(mocks.handleLoadedMetadata).toHaveBeenCalledWith(1);
    expect(mocks.handleTimeUpdate).toHaveBeenCalledWith(1);
    expect(mocks.togglePlayback).toHaveBeenCalledOnce();
    expect(mocks.restart).toHaveBeenCalledOnce();
    expect(mocks.seekTo).toHaveBeenCalledWith(13.5);
  });

  it("renders video layers with poster URLs and skips missing object URLs", () => {
    mocks.objectUrls = ["blob:video", "blob:poster"];

    const layer = LongrSequenceVideoLayer({
      clip: createClip("clip_1"),
      isActive: true,
      onEnded: vi.fn(),
      onLoadedMetadata: vi.fn(),
      onTimeUpdate: vi.fn(),
      videoRef: vi.fn(),
    });
    const [video] = findElements(layer, (element) => element.type === "video");

    expect(video.props.src).toBe("blob:video");
    expect(video.props.poster).toBe("blob:poster");
    expect(video.props["aria-hidden"]).toBe(false);

    mocks.objectUrls = [null, null];

    expect(
      LongrSequenceVideoLayer({
        clip: createClip("clip_2"),
        isActive: false,
        onEnded: vi.fn(),
        onLoadedMetadata: vi.fn(),
        onTimeUpdate: vi.fn(),
        videoRef: vi.fn(),
      }),
    ).toBeNull();
  });
});
