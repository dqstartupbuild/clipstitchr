import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSequenceVideoPlayer } from "@/lib/clipstitchr/hooks/useSequenceVideoPlayer";

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

describe("useSequenceVideoPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refQueue = [];
    mocks.stateSetters.length = 0;
    mocks.stateQueue = [];
  });

  it("plays UGC first, transitions to demo, seeks, and completes", async () => {
    const player = useSequenceVideoPlayer({
      demoTrimRange: { end: 14, start: 10 },
      ugcTrimRange: { end: 8, start: 2 },
    });
    const ugcVideo = createVideo(0);
    const demoVideo = createVideo(0);

    player.ugcVideoRef.current = ugcVideo;
    player.demoVideoRef.current = demoVideo;

    player.handleLoadedMetadata("ugc");
    expect(ugcVideo.currentTime).toBe(2);
    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(0);

    player.togglePlayback();
    await Promise.resolve();
    expect(ugcVideo.play).toHaveBeenCalledTimes(1);
    expect(mocks.stateSetters[2]).toHaveBeenLastCalledWith(true);

    ugcVideo.currentTime = 8;
    player.handleTimeUpdate("ugc");
    await Promise.resolve();
    expect(ugcVideo.pause).toHaveBeenCalled();
    expect(ugcVideo.currentTime).toBe(8);
    expect(demoVideo.currentTime).toBe(10);
    expect(demoVideo.play).toHaveBeenCalledTimes(1);
    expect(mocks.stateSetters[0]).toHaveBeenLastCalledWith("demo");
    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(6);

    player.seekTo(7);
    await Promise.resolve();
    expect(ugcVideo.pause).toHaveBeenCalledTimes(2);
    expect(demoVideo.currentTime).toBe(11);
    expect(mocks.stateSetters[0]).toHaveBeenLastCalledWith("demo");
    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(7);

    player.handleEnded("demo");
    expect(ugcVideo.pause).toHaveBeenCalled();
    expect(demoVideo.pause).toHaveBeenCalled();
    expect(demoVideo.currentTime).toBe(14);
    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(10);
    expect(mocks.stateSetters[2]).toHaveBeenLastCalledWith(false);
  });

  it("restarts from the beginning and ignores inactive ended events", async () => {
    const player = useSequenceVideoPlayer({
      demoTrimRange: { end: 5, start: 5 },
      ugcTrimRange: { end: 4, start: 1 },
    });
    const ugcVideo = createVideo(3);
    const demoVideo = createVideo(7);

    player.ugcVideoRef.current = ugcVideo;
    player.demoVideoRef.current = demoVideo;

    player.handleEnded("demo");
    expect(demoVideo.pause).not.toHaveBeenCalled();

    player.restart();
    await Promise.resolve();
    expect(demoVideo.pause).toHaveBeenCalledTimes(1);
    expect(ugcVideo.currentTime).toBe(1);
    expect(demoVideo.currentTime).toBe(5);
    expect(ugcVideo.play).toHaveBeenCalledTimes(1);
    expect(mocks.stateSetters[0]).toHaveBeenLastCalledWith("ugc");
    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(0);
  });

  it("falls back to paused when the active video is missing", () => {
    const player = useSequenceVideoPlayer({
      demoTrimRange: { end: 4, start: 2 },
      ugcTrimRange: { end: 1, start: 1 },
    });

    player.togglePlayback();
    player.seekTo(20);

    expect(mocks.stateSetters[2]).toHaveBeenCalledWith(false);
    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(2);
  });

  it("runs playback frames, pauses toggled playback, and handles failed plays", async () => {
    let cleanup: (() => void) | undefined;

    vi.stubGlobal("window", {
      cancelAnimationFrame: vi.fn(),
      requestAnimationFrame: vi.fn((callback: () => void) => {
        callback();
        return 7;
      }),
    });
    mocks.stateQueue = ["ugc", 0, true];
    mocks.useEffect.mockImplementationOnce((effect: () => void | (() => void)) => {
      const result = effect();

      if (typeof result === "function") {
        cleanup = result;
      }
    });

    useSequenceVideoPlayer({
      demoTrimRange: { end: 4, start: 2 },
      ugcTrimRange: { end: 1, start: 0 },
    });

    expect(window.requestAnimationFrame).toHaveBeenCalled();
    cleanup?.();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(7);

    mocks.stateSetters.length = 0;
    const player = useSequenceVideoPlayer({
      demoTrimRange: { end: 4, start: 4 },
      ugcTrimRange: { end: 2, start: 0 },
    });
    const ugcVideo = createVideo(0);
    const demoVideo = createVideo(0);

    player.ugcVideoRef.current = ugcVideo;
    player.demoVideoRef.current = demoVideo;

    ugcVideo.play.mockRejectedValueOnce(new Error("blocked"));
    player.togglePlayback();
    await Promise.resolve();

    expect(mocks.stateSetters[2]).toHaveBeenLastCalledWith(false);

    ugcVideo.play.mockResolvedValueOnce(undefined);
    player.togglePlayback();
    await Promise.resolve();
    player.togglePlayback();

    expect(ugcVideo.pause).toHaveBeenCalled();

    player.togglePlayback();
    await Promise.resolve();
    player.handleEnded("ugc");

    expect(demoVideo.pause).toHaveBeenCalled();
    expect(demoVideo.currentTime).toBe(4);

    vi.unstubAllGlobals();
  });

  it("covers metadata, frame, and end-of-sequence edge paths", async () => {
    const ugcVideo = createVideo(2);
    const demoVideo = createVideo(4);
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
      { current: ugcVideo },
      { current: demoVideo },
      { current: "ugc" },
      { current: 10 },
      { current: true },
    ];
    mocks.stateQueue = ["ugc", 0, true];
    mocks.useEffect.mockImplementationOnce((effect: () => void | (() => void)) => {
      effect();
    });

    const player = useSequenceVideoPlayer({
      demoTrimRange: { end: 6, start: 4 },
      ugcTrimRange: { end: 2, start: 0 },
    });

    expect(demoVideo.currentTime).toBe(4);
    expect(demoVideo.play).toHaveBeenCalled();
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);

    player.handleLoadedMetadata("demo");
    player.handleTimeUpdate("ugc");

    expect(demoVideo.currentTime).toBe(4);

    vi.unstubAllGlobals();
  });

  it("resets out-of-range playback, handles demo play failures, and restarts completed playback", async () => {
    const ugcVideo = createVideo(99);
    const demoVideo = createVideo(4);

    demoVideo.play.mockRejectedValueOnce(new Error("blocked"));

    const player = useSequenceVideoPlayer({
      demoTrimRange: { end: 6, start: 4 },
      ugcTrimRange: { end: 2, start: 0 },
    });

    player.ugcVideoRef.current = ugcVideo;
    player.demoVideoRef.current = demoVideo;
    player.togglePlayback();
    await Promise.resolve();

    expect(ugcVideo.currentTime).toBe(0);

    ugcVideo.currentTime = 2;
    player.handleEnded("ugc");
    await Promise.resolve();

    expect(mocks.stateSetters[2]).toHaveBeenLastCalledWith(false);

    player.handleTimeUpdate("demo");

    expect(mocks.stateSetters[1]).toHaveBeenLastCalledWith(2);

    player.seekTo(10);
    player.togglePlayback();

    expect(ugcVideo.currentTime).toBe(0);
  });
});
