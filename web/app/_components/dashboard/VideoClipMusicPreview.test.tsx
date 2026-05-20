import { beforeEach, describe, expect, it, vi } from "vitest";
import { VideoClipMusicPreview } from "@/app/_components/dashboard/VideoClipMusicPreview";

const mocks = vi.hoisted(() => ({
  refQueue: [] as Array<{ current: unknown }>,
  stateSetter: vi.fn(),
  useEffect: vi.fn(),
  useObjectUrl: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useEffect: mocks.useEffect,
    useRef: () => mocks.refQueue.shift() ?? { current: null },
    useState: (initialValue: unknown) => [initialValue, mocks.stateSetter],
  };
});

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

function findElements(
  value: unknown,
  predicate: (element: { props?: Record<string, unknown>; type?: unknown }) => boolean,
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
  const matches = predicate(element as { props?: Record<string, unknown>; type?: unknown })
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [
    ...matches,
    ...findElements(element.props?.children, predicate),
  ];
}

describe("VideoClipMusicPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refQueue = [];
    mocks.useEffect.mockImplementation((effect: () => void) => {
      effect();
    });
    mocks.useObjectUrl.mockReturnValue("blob:music");
  });

  it("syncs external music to trimmed video playback events", async () => {
    const video = {
      currentTime: 4,
      muted: false,
      volume: 0,
    };
    const audio = {
      currentTime: 0,
      duration: 2,
      muted: true,
      pause: vi.fn(),
      play: vi.fn(async () => undefined),
      volume: 0,
    };

    mocks.refQueue = [{ current: video }, { current: audio }];

    const tree = VideoClipMusicPreview({
      hasSourceAudio: true,
      label: "Preview clip",
      musicBlob: new Blob(["music"], { type: "audio/mpeg" }),
      musicEnabled: true,
      musicVolume: 0.5,
      posterSrc: "poster.jpg",
      src: "clip.mp4",
      trimRange: { start: 1, end: 3 },
    });
    const [videoElement] = findElements(tree, (element) => element.type === "video");

    (videoElement.props.onLoadedMetadata as () => void)();
    expect(video.currentTime).toBe(1);

    video.currentTime = 4;
    (videoElement.props.onPlay as () => void)();
    expect(video.currentTime).toBe(1);
    expect(audio.play).toHaveBeenCalled();

    video.currentTime = 3;
    (videoElement.props.onTimeUpdate as () => void)();
    expect(video.currentTime).toBe(1);

    (videoElement.props.onPause as () => void)();
    expect(audio.pause).toHaveBeenCalled();
  });

  it("renders poster preview and unavailable states", () => {
    const onLoadPreview = vi.fn();

    mocks.refQueue = [{ current: null }, { current: null }];
    const posterTree = VideoClipMusicPreview({
      hasSourceAudio: false,
      isLoading: false,
      label: "Poster clip",
      musicBlob: null,
      musicEnabled: false,
      musicVolume: 1,
      onLoadPreview,
      posterSrc: "poster.jpg",
      src: null,
    });
    const [posterButton] = findElements(
      posterTree,
      (element) => element.type === "button",
    );

    (posterButton.props.onClick as () => void)();
    expect(onLoadPreview).toHaveBeenCalled();

    mocks.refQueue = [{ current: null }, { current: null }];
    const unavailableTree = VideoClipMusicPreview({
      hasSourceAudio: false,
      isLoading: true,
      label: "Missing clip",
      musicBlob: null,
      musicEnabled: false,
      musicVolume: 1,
      src: null,
    });

    expect(
      findElements(
        unavailableTree,
        (element) =>
          Array.isArray(element.props?.children) ||
          element.props?.children === "Loading preview",
      ).length,
    ).toBeGreaterThan(0);
  });
});
