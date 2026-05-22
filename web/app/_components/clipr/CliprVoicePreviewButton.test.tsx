import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CliprVoicePreviewButton } from "@/app/_components/clipr/CliprVoicePreviewButton";

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

function createAudio(overrides: Partial<HTMLAudioElement> = {}) {
  return {
    addEventListener: vi.fn(),
    currentTime: 0,
    pause: vi.fn(),
    play: vi.fn(async () => undefined),
    preload: "",
    removeEventListener: vi.fn(),
    ...overrides,
  } as unknown as HTMLAudioElement & {
    addEventListener: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };
}

function renderButton() {
  return CliprVoicePreviewButton({
    src: "/voice.mp3",
    voiceName: "Zephyr",
  }) as {
    props: {
      onClick: () => Promise<void>;
    };
  };
}

describe("CliprVoicePreviewButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mocks.refQueue = [];
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    mocks.useEffect.mockImplementation(() => undefined);
  });

  it("renders the full preview button label", () => {
    const markup = renderToStaticMarkup(
      <CliprVoicePreviewButton src="/voice.mp3" voiceName="Zephyr" />,
    );

    expect(markup).toContain('aria-label="Preview Zephyr voice"');
    expect(markup).toContain("Preview");
  });

  it("renders compact and disabled preview states", () => {
    const markup = renderToStaticMarkup(
      <CliprVoicePreviewButton
        disabled
        isCompact
        src="/voice.mp3"
        voiceName="Zephyr"
      />,
    );

    expect(markup).toContain('aria-label="Preview Zephyr voice"');
    expect(markup).toContain("disabled");
    expect(markup).not.toContain(">Preview<");
  });

  it("creates audio, plays, and cleans up preview handlers", async () => {
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

    await renderButton().props.onClick();

    expect(Audio).toHaveBeenCalledWith("/voice.mp3");
    expect(audio.preload).toBe("none");
    expect(audio.addEventListener).toHaveBeenCalledWith(
      "ended",
      expect.any(Function),
    );
    expect(audio.addEventListener).toHaveBeenCalledWith(
      "pause",
      expect.any(Function),
    );
    expect(audio.currentTime).toBe(0);
    expect(audio.play).toHaveBeenCalled();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(true);

    cleanup?.();

    expect(audio.removeEventListener).toHaveBeenCalledWith(
      "ended",
      expect.any(Function),
    );
    expect(audio.removeEventListener).toHaveBeenCalledWith(
      "pause",
      expect.any(Function),
    );
    expect(audio.pause).toHaveBeenCalled();
  });

  it("handles missing audio refs, pause state, and failed playback", async () => {
    await renderButton().props.onClick();

    expect(mocks.setStateCalls[0]).not.toHaveBeenCalled();

    const activeAudio = createAudio({ currentTime: 4 });

    mocks.stateQueue = [true];
    mocks.refQueue = [{ current: activeAudio }];
    await renderButton().props.onClick();

    expect(activeAudio.pause).toHaveBeenCalled();
    expect(activeAudio.currentTime).toBe(0);
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(false);

    const failingAudio = createAudio();

    failingAudio.play.mockRejectedValueOnce(new Error("blocked"));
    mocks.stateQueue = [false];
    mocks.refQueue = [{ current: failingAudio }];

    await renderButton().props.onClick();

    expect(failingAudio.play).toHaveBeenCalled();
    expect(mocks.setStateCalls[2]).toHaveBeenCalledWith(false);
  });
});
