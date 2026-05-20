import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLoadedVideoClip } from "@/lib/clipstitchr/hooks/useLoadedVideoClip";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  cleanups: [] as Array<() => void>,
  stateSetter: vi.fn(),
  stateValue: null as {
    clip: VideoClip | null;
    clipId: string;
  } | null,
}));

vi.mock("react", () => ({
  useEffect: (callback: () => void | (() => void)) => {
    const cleanup = callback();

    if (typeof cleanup === "function") {
      mocks.cleanups.push(cleanup);
    }
  },
  useState: (initialValue: unknown) => [
    mocks.stateValue ?? initialValue,
    mocks.stateSetter,
  ],
}));

function createClip(id: string) {
  return {
    id,
    name: `Clip ${id}`,
  } as unknown as VideoClip;
}

describe("useLoadedVideoClip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cleanups = [];
    mocks.stateValue = null;
  });

  it("does not load when no clip id is selected", () => {
    const loadClip = vi.fn();

    const state = useLoadedVideoClip({
      clipId: null,
      loadClip,
    });

    expect(state).toEqual({
      clip: null,
      isLoading: false,
    });
    expect(loadClip).not.toHaveBeenCalled();
  });

  it("loads the selected clip and reports loading until state catches up", async () => {
    const clip = createClip("clip_1");
    const loadClip = vi.fn().mockResolvedValue(clip);

    const state = useLoadedVideoClip({
      clipId: "clip_1",
      loadClip,
    });

    expect(state).toEqual({
      clip: null,
      isLoading: true,
    });
    await Promise.resolve();
    expect(loadClip).toHaveBeenCalledWith("clip_1");
    expect(mocks.stateSetter).toHaveBeenCalledWith({
      clip,
      clipId: "clip_1",
    });
  });

  it("returns a loaded clip only when it matches the requested id", () => {
    const clip = createClip("clip_1");
    const loadClip = vi.fn().mockResolvedValue(null);
    mocks.stateValue = {
      clip,
      clipId: "clip_1",
    };

    expect(
      useLoadedVideoClip({
        clipId: "clip_1",
        loadClip,
      }),
    ).toEqual({
      clip,
      isLoading: false,
    });

    expect(
      useLoadedVideoClip({
        clipId: "clip_2",
        loadClip,
      }),
    ).toEqual({
      clip: null,
      isLoading: true,
    });
  });

  it("ignores resolved loads after cleanup", async () => {
    const clip = createClip("clip_1");
    const deferred: {
      resolve?: (clip: VideoClip | null) => void;
    } = {};
    const loadClip = vi.fn(
      () =>
        new Promise<VideoClip | null>((resolve) => {
          deferred.resolve = resolve;
        }),
    );

    useLoadedVideoClip({
      clipId: "clip_1",
      loadClip,
    });
    mocks.cleanups[0]();

    if (!deferred.resolve) {
      throw new Error("Expected load promise resolver to be assigned.");
    }

    deferred.resolve(clip);
    await Promise.resolve();

    expect(mocks.stateSetter).not.toHaveBeenCalled();
  });
});
