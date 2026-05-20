import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";

const mocks = vi.hoisted(() => ({
  refValue: { current: null as unknown },
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => effect(),
    useRef: () => mocks.refValue,
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

function createVideo() {
  return {
    currentTime: 0,
    play: vi.fn(async () => undefined),
  };
}

describe("VideoPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refValue = { current: createVideo() };
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
  });

  it("autoplays, trims, toggles hover state, and keeps playback inside trim", async () => {
    const video = createVideo();

    mocks.refValue = { current: video };
    mocks.stateQueue = [false, false];

    const tree = VideoPreview({
      autoPlay: true,
      label: "Demo clip",
      posterSrc: "poster.jpg",
      src: "demo.mp4",
      trimRange: { start: 1, end: 2 },
    });

    expect(video.currentTime).toBe(1);
    await Promise.resolve();
    expect(video.play).toHaveBeenCalledOnce();
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(true);

    const root = findElements(
      tree,
      (element) =>
        element.type === "div" &&
        String(element.props?.className).includes("aspect-[9/16]"),
    )[0];
    const videoElement = findElements(
      tree,
      (element) => element.type === "video",
    )[0];

    (root.props.onMouseEnter as () => void)();
    (root.props.onFocus as () => void)();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(true);
    (root.props.onMouseLeave as () => void)();
    (root.props.onBlur as () => void)();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(false);

    video.currentTime = 5;
    (videoElement.props.onLoadedMetadata as () => void)();
    expect(video.currentTime).toBe(1);

    video.currentTime = 3;
    (videoElement.props.onPlay as () => void)();
    expect(video.currentTime).toBe(1);
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(true);

    video.currentTime = 2.5;
    (videoElement.props.onTimeUpdate as () => void)();
    expect(video.currentTime).toBe(1);

    video.currentTime = 2.5;
    (videoElement.props.onEnded as () => void)();
    expect(video.currentTime).toBe(1);

    (videoElement.props.onPause as () => void)();
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(false);
  });

  it("marks playback as stopped when autoplay is unavailable", async () => {
    const video = createVideo();

    video.play.mockRejectedValueOnce(new Error("blocked"));
    mocks.refValue = { current: video };
    mocks.stateQueue = [false, false];

    VideoPreview({
      autoPlay: true,
      label: "Demo clip",
      src: "demo.mp4",
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(false);
  });

  it("renders poster, lazy preview, and unavailable states", () => {
    const onLoadPreview = vi.fn();

    mocks.refValue = { current: null };
    mocks.stateQueue = [false, false];

    const loadingPosterTree = VideoPreview({
      isLoading: true,
      label: "Demo clip",
      onLoadPreview,
      posterSrc: "poster.jpg",
      src: null,
    });
    const loadingPosterButton = findElements(
      loadingPosterTree,
      (element) => element.type === "button",
    )[0];

    expect(loadingPosterButton.props.disabled).toBe(true);
    expect(loadingPosterButton.props["aria-label"]).toBe(
      "Loading preview for Demo clip",
    );
    (loadingPosterButton.props.onClick as () => void)();
    expect(onLoadPreview).toHaveBeenCalledOnce();

    mocks.stateQueue = [false, false];
    const posterTree = VideoPreview({
      label: "Demo poster",
      posterSrc: "poster.jpg",
      src: null,
    });
    expect(
      findElements(posterTree, (element) => element.props?.role === "img")[0]
        .props.style,
    ).toEqual({ backgroundImage: "url(poster.jpg)" });

    mocks.stateQueue = [false, false];
    const previewButtonTree = VideoPreview({
      label: "Demo clip",
      onLoadPreview,
      src: null,
    });
    const previewButton = findElements(
      previewButtonTree,
      (element) => element.type === "button",
    )[0];

    expect(previewButton.props.children).toBe("Preview");
    (previewButton.props.onClick as () => void)();
    expect(onLoadPreview).toHaveBeenCalledTimes(2);

    mocks.stateQueue = [false, false];
    expect(
      renderToStaticMarkup(
        <VideoPreview isLoading={true} label="Demo clip" src={null} />,
      ),
    ).toContain("Loading preview");

    mocks.stateQueue = [false, false];
    expect(
      renderToStaticMarkup(<VideoPreview label="Demo clip" src={null} />),
    ).toContain("Preview unavailable");
  });
});
