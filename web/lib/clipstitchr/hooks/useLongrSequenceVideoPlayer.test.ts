import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLongrSequenceVideoPlayer } from "@/lib/clipstitchr/hooks/useLongrSequenceVideoPlayer";

const mocks = vi.hoisted(() => ({
  refQueue: [] as Array<{ current: unknown }>,
  stateSetters: [] as ReturnType<typeof vi.fn>[],
  stateQueue: [] as unknown[],
  useEffect: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useEffect: mocks.useEffect,
  useMemo: (factory: () => unknown) => factory(),
  useRef: (value: unknown) => mocks.refQueue.shift() ?? { current: value },
  useState: (initialValue: unknown) => {
    const setter = vi.fn();
    const nextValue = mocks.stateQueue.length
      ? mocks.stateQueue.shift()
      : typeof initialValue === "function"
        ? (initialValue as () => unknown)()
        : initialValue;

    mocks.stateSetters.push(setter);

    return [nextValue, setter];
  },
}));

function createVideo(currentTime: number) {
  return {
    currentTime,
    pause: vi.fn(),
    play: vi.fn(async () => undefined),
  } as unknown as HTMLVideoElement & {
    pause: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
  };
}

describe("useLongrSequenceVideoPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refQueue = [];
    mocks.stateSetters.length = 0;
    mocks.stateQueue = [];
  });

  it("plays clips in order, skips zero-length clips, seeks, and completes", async () => {
    const player = useLongrSequenceVideoPlayer({
      trimRanges: [
        { end: 4, start: 1 },
        { end: 10, start: 10 },
        { end: 25, start: 20 },
      ],
    });
    const firstVideo = createVideo(0);
    const skippedVideo = createVideo(0);
    const finalVideo = createVideo(0);

    player.setVideoRef(0, firstVideo);
    player.setVideoRef(1, skippedVideo);
    player.setVideoRef(2, finalVideo);

    expect(player.totalDuration).toBe(8);

    player.togglePlayback();
    await Promise.resolve();
    expect(firstVideo.currentTime).toBe(1);
    expect(firstVideo.play).toHaveBeenCalledTimes(1);
    expect(mocks.stateSetters[2]).toHaveBeenLastCalledWith(true);

    firstVideo.currentTime = 4;
    player.handleTimeUpdate(0);
    await Promise.resolve();
    expect(firstVideo.pause).toHaveBeenCalled();
    expect(skippedVideo.play).not.toHaveBeenCalled();
    expect(finalVideo.currentTime).toBe(20);
    expect(finalVideo.play).toHaveBeenCalledTimes(1);
    expect(mocks.stateSetters[0]).toHaveBeenLastCalledWith(2);
    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(3);

    player.seekTo(5);
    await Promise.resolve();
    expect(finalVideo.currentTime).toBe(22);
    expect(mocks.stateSetters[0]).toHaveBeenLastCalledWith(2);
    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(5);

    player.handleEnded(2);
    expect(firstVideo.pause).toHaveBeenCalled();
    expect(skippedVideo.pause).toHaveBeenCalled();
    expect(finalVideo.pause).toHaveBeenCalled();
    expect(finalVideo.currentTime).toBe(25);
    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(8);
    expect(mocks.stateSetters[2]).toHaveBeenLastCalledWith(false);
  });

  it("restarts at the first playable clip and resets all video times", async () => {
    const player = useLongrSequenceVideoPlayer({
      trimRanges: [
        { end: 3, start: 3 },
        { end: 8, start: 6 },
        { end: 15, start: 10 },
      ],
    });
    const firstVideo = createVideo(12);
    const secondVideo = createVideo(12);
    const thirdVideo = createVideo(12);

    player.setVideoRef(0, firstVideo);
    player.setVideoRef(1, secondVideo);
    player.setVideoRef(2, thirdVideo);

    player.restart();
    await Promise.resolve();
    expect(firstVideo.currentTime).toBe(3);
    expect(secondVideo.currentTime).toBe(6);
    expect(thirdVideo.currentTime).toBe(10);
    expect(firstVideo.pause).toHaveBeenCalled();
    expect(thirdVideo.pause).toHaveBeenCalled();
    expect(secondVideo.play).toHaveBeenCalledTimes(1);
    expect(mocks.stateSetters[0]).toHaveBeenLastCalledWith(1);
    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(0);
  });

  it("handles empty sequences as completed and paused", () => {
    const player = useLongrSequenceVideoPlayer({ trimRanges: [] });

    player.togglePlayback();
    player.restart();
    player.seekTo(5);

    expect(mocks.stateSetters[0]).toHaveBeenCalledWith(0);
    expect(mocks.stateSetters[1]).toHaveBeenCalledWith(0);
    expect(mocks.stateSetters[2]).toHaveBeenCalledWith(false);
  });

  it("runs frame effects, effect resets, pause toggles, and rejected plays", async () => {
    let cleanup: (() => void) | undefined;

    vi.stubGlobal("window", {
      cancelAnimationFrame: vi.fn(),
      requestAnimationFrame: vi.fn((callback: () => void) => {
        callback();
        return 9;
      }),
    });
    mocks.stateQueue = [0, 0, true];
    mocks.useEffect.mockImplementationOnce((effect: () => void | (() => void)) => {
      const result = effect();

      if (typeof result === "function") {
        cleanup = result;
      }
    });

    useLongrSequenceVideoPlayer({
      trimRanges: [{ end: 4, start: 1 }],
    });

    expect(window.requestAnimationFrame).toHaveBeenCalled();
    cleanup?.();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(9);

    mocks.stateSetters.length = 0;
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      effect();
    });
    useLongrSequenceVideoPlayer({ trimRanges: [] });
    await Promise.resolve();

    expect(mocks.stateSetters[0]).toHaveBeenCalledWith(0);
    expect(mocks.stateSetters[1]).toHaveBeenCalledWith(0);
    expect(mocks.stateSetters[2]).toHaveBeenCalledWith(false);

    mocks.useEffect.mockReset();
    mocks.stateSetters.length = 0;
    const player = useLongrSequenceVideoPlayer({
      trimRanges: [{ end: 3, start: 0 }],
    });
    const video = createVideo(0);

    player.setVideoRef(0, video);
    video.play.mockRejectedValueOnce(new Error("blocked"));
    player.togglePlayback();
    await Promise.resolve();

    expect(mocks.stateSetters[2]).toHaveBeenLastCalledWith(false);

    video.play.mockResolvedValueOnce(undefined);
    player.togglePlayback();
    await Promise.resolve();
    player.togglePlayback();

    expect(video.pause).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("covers frame transitions and trim-range reset effects", async () => {
    const firstVideo = createVideo(3);
    const secondVideo = createVideo(5);
    let frameCalls = 0;

    vi.stubGlobal("window", {
      cancelAnimationFrame: vi.fn(),
      requestAnimationFrame: vi.fn((callback: () => void) => {
        frameCalls += 1;

        if (frameCalls === 1) {
          callback();
        }

        return frameCalls;
      }),
    });
    mocks.refQueue = [
      { current: [firstVideo, secondVideo] },
      { current: 0 },
      { current: 0 },
      { current: true },
    ];
    mocks.stateQueue = [0, 0, true];
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      effect();
    });

    useLongrSequenceVideoPlayer({
      trimRanges: [
        { end: 3, start: 0 },
        { end: 7, start: 5 },
      ],
    });

    expect(secondVideo.currentTime).toBe(5);
    expect(secondVideo.play).toHaveBeenCalled();
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);

    mocks.stateSetters.length = 0;
    mocks.refQueue = [
      { current: [] },
      { current: 2 },
      { current: 0 },
      { current: false },
    ];
    mocks.stateQueue = [2, 0, false];
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      effect();
    });

    useLongrSequenceVideoPlayer({
      trimRanges: [{ end: 2, start: 0 }],
    });
    await Promise.resolve();

    expect(mocks.stateSetters[0]).toHaveBeenCalledWith(0);
    expect(mocks.stateSetters[1]).toHaveBeenCalledWith(0);

    vi.unstubAllGlobals();
  });

  it("handles missing videos, metadata guards, inactive updates, and completed replay", async () => {
    const player = useLongrSequenceVideoPlayer({
      trimRanges: [
        { end: 2, start: 0 },
        { end: 5, start: 4 },
      ],
    });

    player.togglePlayback();
    expect(mocks.stateSetters[2]).toHaveBeenCalledWith(false);

    player.handleLoadedMetadata(1);
    player.handleTimeUpdate(1);
    player.handleEnded(1);

    const firstVideo = createVideo(10);
    const secondVideo = createVideo(4);

    player.setVideoRef(0, firstVideo);
    player.setVideoRef(1, secondVideo);
    player.handleLoadedMetadata(0);
    player.handleTimeUpdate(0);

    expect(firstVideo.currentTime).toBe(0);

    player.seekTo(3);
    player.handleTimeUpdate(1);

    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(3);

    player.seekTo(10);
    player.togglePlayback();
    await Promise.resolve();

    expect(firstVideo.currentTime).toBe(0);
  });
});
