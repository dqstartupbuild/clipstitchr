import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLongrSequenceVideoPlayer } from "@/lib/clipstitchr/hooks/useLongrSequenceVideoPlayer";

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

describe("useLongrSequenceVideoPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.stateSetters.length = 0;
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
});
