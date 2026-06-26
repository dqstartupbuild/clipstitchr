import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TikTokSoundPreviewButton } from "@/app/_components/music/TikTokSoundPreviewButton";

const mocks = vi.hoisted(() => ({
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

function renderButton(playUrl = "https://example.com/sound.mp3") {
  return TikTokSoundPreviewButton({
    playUrl,
    title: "Trend Sound",
  }) as {
    props: {
      onClick: () => void;
    };
  };
}

describe("TikTokSoundPreviewButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mocks.refQueue = [];
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    mocks.useEffect.mockImplementation(() => undefined);
  });

  it("renders preview, unavailable, playing, and error labels", () => {
    expect(
      renderToStaticMarkup(
        <TikTokSoundPreviewButton
          playUrl="https://example.com/sound.mp3"
          title="Trend Sound"
        />,
      ),
    ).toContain("IconButton:Preview Trend Sound:false:");

    expect(
      renderToStaticMarkup(<TikTokSoundPreviewButton title="Trend Sound" />),
    ).toContain("IconButton:No preview for Trend Sound:true:");

    mocks.stateQueue = [true, false, null];

    expect(
      renderToStaticMarkup(
        <TikTokSoundPreviewButton
          playUrl="https://example.com/sound.mp3"
          title="Trend Sound"
        />,
      ),
    ).toContain("IconButton:Pause Trend Sound:false:");

    mocks.stateQueue = [false, true, "Unable to preview this sound."];

    expect(
      renderToStaticMarkup(
        <TikTokSoundPreviewButton
          playUrl="https://example.com/sound.mp3"
          title="Trend Sound"
        />,
      ),
    ).toContain(
      "IconButton:Unable to preview this sound.:true:border-red-200 text-red-600",
    );
  });

  it("plays and cleans up a direct TikTok preview URL", async () => {
    let cleanup: (() => void) | undefined;
    const audio = createAudio();

    vi.stubGlobal(
      "Audio",
      vi.fn(function AudioMock() {
        return audio;
      }),
    );
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

    expect(Audio).toHaveBeenCalledWith("https://example.com/sound.mp3");
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
  });

  it("pauses, rewinds ended audio, and surfaces preview failures", async () => {
    const playingAudio = createAudio();

    mocks.stateQueue = [true, false, null];
    mocks.refQueue = [{ current: playingAudio }];
    renderButton().props.onClick();
    await Promise.resolve();

    expect(playingAudio.pause).toHaveBeenCalled();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(false);

    mocks.setStateCalls = [];
    const endedAudio = createAudio({ currentTime: 12, ended: true });

    mocks.stateQueue = [false, false, null];
    mocks.refQueue = [{ current: endedAudio }];
    renderButton().props.onClick();
    await Promise.resolve();
    await Promise.resolve();

    expect(endedAudio.currentTime).toBe(0);
    expect(endedAudio.play).toHaveBeenCalled();

    mocks.setStateCalls = [];
    mocks.stateQueue = [false, false, null];
    vi.stubGlobal(
      "Audio",
      vi.fn(function AudioMock() {
        return createAudio({
          play: vi.fn(async () => {
            throw new Error("blocked");
          }),
        });
      }),
    );

    renderButton().props.onClick();
    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.setStateCalls[2]).toHaveBeenCalledWith(
      "Unable to preview this sound.",
    );
    expect(mocks.setStateCalls[1]).toHaveBeenLastCalledWith(false);
  });
});
