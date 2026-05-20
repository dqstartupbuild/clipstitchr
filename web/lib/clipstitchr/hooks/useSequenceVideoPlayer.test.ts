import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSequenceVideoPlayer } from "@/lib/clipstitchr/hooks/useSequenceVideoPlayer";

const mocks = vi.hoisted(() => ({
  stateSetters: [] as ReturnType<typeof vi.fn>[],
  useEffect: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useEffect: mocks.useEffect,
  useMemo: (factory: () => unknown) => factory(),
  useRef: (value: unknown) => ({ current: value }),
  useState: (initialValue: unknown) => {
    const setter = vi.fn();

    mocks.stateSetters.push(setter);

    return [
      typeof initialValue === "function"
        ? (initialValue as () => unknown)()
        : initialValue,
      setter,
    ];
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
    mocks.stateSetters.length = 0;
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
});
