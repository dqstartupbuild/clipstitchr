import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { seekVideoToTime } from "@/lib/clipstitchr/media/seekVideoToTime";

type Listener = () => void;

function createVideo() {
  const listeners = new Map<string, Listener>();
  let currentTime = 0;

  return {
    video: {
      addEventListener: vi.fn((eventName: string, listener: Listener) => {
        listeners.set(eventName, listener);
      }),
      get currentTime() {
        return currentTime;
      },
      set currentTime(value: number) {
        currentTime = value;
      },
      readyState: 2,
      removeEventListener: vi.fn(),
    } as unknown as HTMLVideoElement,
    listeners,
  };
}

describe("seekVideoToTime", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      clearTimeout: vi.fn(),
      setTimeout: vi.fn(() => 123),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns immediately when the video is already at the requested time", async () => {
    const { video } = createVideo();
    video.currentTime = 2;

    await expect(seekVideoToTime(video, 2)).resolves.toBeUndefined();
    expect(video.addEventListener).not.toHaveBeenCalled();
  });

  it("resolves on seeked and cleans up listeners", async () => {
    const { listeners, video } = createVideo();
    const promise = seekVideoToTime(video, 4);

    expect(video.currentTime).toBe(4);
    listeners.get("seeked")?.();

    await expect(promise).resolves.toBeUndefined();
    expect(video.removeEventListener).toHaveBeenCalledWith(
      "seeked",
      expect.any(Function),
    );
    expect(window.clearTimeout).toHaveBeenCalledWith(123);
  });

  it("rejects on video errors and timeouts", async () => {
    const errorVideo = createVideo();
    const errorPromise = seekVideoToTime(errorVideo.video, 4);
    errorVideo.listeners.get("error")?.();

    await expect(errorPromise).rejects.toThrow(
      "Unable to seek video for poster capture.",
    );

    vi.useFakeTimers();
    vi.stubGlobal("window", {
      clearTimeout,
      setTimeout,
    });
    const timeoutPromise = seekVideoToTime(createVideo().video, 4);

    vi.advanceTimersByTime(7000);

    await expect(timeoutPromise).rejects.toThrow(
      "Timed out seeking video for poster capture.",
    );
    vi.useRealTimers();
  });
});
