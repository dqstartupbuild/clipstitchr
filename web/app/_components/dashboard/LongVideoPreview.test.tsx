import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LongVideoPreview } from "@/app/_components/dashboard/LongVideoPreview";

const mocks = vi.hoisted(() => ({
  refValue: { current: null as unknown },
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
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
    currentTime: 10,
    duration: 12,
    pause: vi.fn(),
    play: vi.fn(async () => undefined),
  };
}

describe("LongVideoPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refValue = { current: createVideo() };
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
  });

  it("drives playback, restart, metadata, timeline, and ended handlers", () => {
    const video = createVideo();

    mocks.refValue = { current: video };
    mocks.stateQueue = [2, false, 10];

    const tree = LongVideoPreview({
      duration: 10,
      label: "Long preview",
      posterSrc: "poster.jpg",
      src: "long.mp4",
    });
    const videoElement = findElements(
      tree,
      (element) => element.type === "video",
    )[0];
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

    (videoElement.props.onLoadedMetadata as () => void)();
    expect(mocks.setStateCalls[2]).toHaveBeenCalledWith(12);

    (videoElement.props.onPlay as () => void)();
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(true);

    (videoElement.props.onTimeUpdate as (event: {
      currentTarget: { currentTime: number };
    }) => void)({ currentTarget: { currentTime: 3.5 } });
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(3.5);

    (videoElement.props.onEnded as () => void)();
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(false);
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(10);

    (iconButtons[0].props.onClick as () => void)();
    expect(video.currentTime).toBe(0);
    expect(video.play).toHaveBeenCalledTimes(1);

    video.currentTime = 5;
    (iconButtons[1].props.onClick as () => void)();
    expect(video.currentTime).toBe(0);
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(0);
    expect(video.play).toHaveBeenCalledTimes(2);

    (range.props.onChange as (event: { target: { value: string } }) => void)({
      target: { value: "99" },
    });
    expect(video.currentTime).toBe(10);
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(10);
  });

  it("pauses when currently playing and renders the unavailable state", () => {
    const video = createVideo();

    mocks.refValue = { current: video };
    mocks.stateQueue = [4, true, 10];

    const playingTree = LongVideoPreview({
      duration: 10,
      label: "Long preview",
      src: "long.mp4",
    });
    const iconButtons = findElements(
      playingTree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "IconButton",
    );

    (iconButtons[0].props.onClick as () => void)();
    expect(video.pause).toHaveBeenCalledOnce();
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(false);

    mocks.setStateCalls = [];
    mocks.stateQueue = [0, false, 10];

    expect(
      renderToStaticMarkup(
        <LongVideoPreview duration={10} label="Long preview" src={null} />,
      ),
    ).toContain("Preview unavailable");
  });

  it("keeps playback stopped when play fails", async () => {
    const video = createVideo();

    video.play.mockRejectedValueOnce(new Error("blocked"));
    mocks.refValue = { current: video };
    mocks.stateQueue = [10, false, 10];

    const tree = LongVideoPreview({
      duration: 10,
      label: "Long preview",
      src: "long.mp4",
    });
    const iconButtons = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "IconButton",
    );

    (iconButtons[0].props.onClick as () => void)();
    await Promise.resolve();

    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(false);
  });
});
