import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MusicTrackPreviewButton } from "@/app/_components/music/MusicTrackPreviewButton";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

const mocks = vi.hoisted(() => ({
  downloadMusicBlob: vi.fn(),
  refQueue: [] as Array<{ current: unknown }>,
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  useEffect: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: mocks.useEffect,
    useRef: (initialValue: unknown) =>
      mocks.refQueue.shift() ?? { current: initialValue },
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : initialValue;
      const setState = vi.fn();

      mocks.setStateCalls.push(setState);

      return [value, setState];
    },
  };
});

vi.mock("@/app/_components/ui/IconButton", () => ({
  IconButton: ({
    className,
    disabled,
    label,
  }: {
    className?: string;
    disabled?: boolean;
    label: string;
  }) => `IconButton:${label}:${Boolean(disabled)}:${className ?? ""}`,
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadMusicBlob", () => ({
  downloadMusicBlob: mocks.downloadMusicBlob,
}));

function createTrack(): SharedMusicTrack {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "shared/music/track.mp3",
      size: 100,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    durationSeconds: 30,
    id: "track_1",
    isOwnedByCurrentUser: false,
    mimeType: "audio/mpeg",
    size: 100,
    source: "library",
    tags: ["upbeat"],
    title: "Upbeat Launch",
    uploadedByOwnerId: "owner_1",
  };
}

function createAudio(overrides: Partial<HTMLAudioElement> = {}) {
  return {
    addEventListener: vi.fn(),
    currentTime: 0,
    ended: false,
    pause: vi.fn(),
    play: vi.fn(async () => undefined),
    preload: "",
    ...overrides,
  } as unknown as HTMLAudioElement & {
    addEventListener: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
  };
}

function renderButton() {
  return MusicTrackPreviewButton({ track: createTrack() }) as {
    props: {
      onClick: () => void;
    };
  };
}

describe("MusicTrackPreviewButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mocks.refQueue = [];
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    mocks.useEffect.mockImplementation(() => undefined);
    mocks.downloadMusicBlob.mockResolvedValue(
      new Blob(["audio"], { type: "audio/mpeg" }),
    );
  });

  it("renders an idle preview button for the track", () => {
    expect(
      renderToStaticMarkup(<MusicTrackPreviewButton track={createTrack()} />),
    ).toContain("IconButton:Preview Upbeat Launch:false:");
  });

  it("renders playing, loading, and error labels", () => {
    mocks.stateQueue = [true, false, null];

    expect(
      renderToStaticMarkup(<MusicTrackPreviewButton track={createTrack()} />),
    ).toContain("IconButton:Pause Upbeat Launch:false:");

    mocks.stateQueue = [false, true, "Unable to preview this track."];

    expect(
      renderToStaticMarkup(<MusicTrackPreviewButton track={createTrack()} />),
    ).toContain(
      "IconButton:Unable to preview this track.:true:border-red-200 text-red-600",
    );
  });

  it("downloads, plays, and cleans up a track preview", async () => {
    let cleanup: (() => void) | undefined;
    const audio = createAudio();
    const createObjectURL = vi.fn(() => "blob:track");
    const revokeObjectURL = vi.fn();

    vi.stubGlobal(
      "Audio",
      vi.fn(function AudioMock() {
        return audio;
      }),
    );
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });
    mocks.useEffect.mockImplementationOnce(
      (effect: () => void | (() => void)) => {
        const result = effect();

        if (typeof result === "function") {
          cleanup = result;
        }
      },
    );

    renderButton().props.onClick();
    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.downloadMusicBlob).toHaveBeenCalledWith({
      audioObject: createTrack().audioObject,
      sharedTrackId: "track_1",
    });
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(audio.addEventListener).toHaveBeenCalledWith(
      "ended",
      expect.any(Function),
    );
    expect(audio.addEventListener).toHaveBeenCalledWith(
      "pause",
      expect.any(Function),
    );
    expect(audio.play).toHaveBeenCalled();
    expect(
      mocks.setStateCalls.flatMap((setState) =>
        setState.mock.calls.map(([value]) => value),
      ),
    ).toEqual(expect.arrayContaining([true, false]));

    cleanup?.();

    expect(audio.pause).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:track");
  });

  it("pauses, rewinds ended audio, and surfaces preview failures", async () => {
    const playingAudio = createAudio();

    mocks.stateQueue = [true, false, null];
    mocks.refQueue = [{ current: playingAudio }, { current: null }];
    renderButton().props.onClick();
    await Promise.resolve();

    expect(playingAudio.pause).toHaveBeenCalled();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(false);
    expect(mocks.downloadMusicBlob).not.toHaveBeenCalled();

    mocks.setStateCalls = [];
    const endedAudio = createAudio({ currentTime: 12, ended: true });

    mocks.stateQueue = [false, false, null];
    mocks.refQueue = [{ current: endedAudio }, { current: null }];

    renderButton().props.onClick();
    await Promise.resolve();
    await Promise.resolve();

    expect(endedAudio.currentTime).toBe(0);
    expect(endedAudio.play).toHaveBeenCalled();

    mocks.setStateCalls = [];
    mocks.stateQueue = [false, false, null];
    mocks.downloadMusicBlob.mockRejectedValueOnce(new Error("offline"));

    renderButton().props.onClick();
    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.setStateCalls[2]).toHaveBeenCalledWith(
      "Unable to preview this track.",
    );
    expect(mocks.setStateCalls[1]).toHaveBeenLastCalledWith(false);
  });
});
