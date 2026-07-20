import { beforeEach, describe, expect, it, vi } from "vitest";
import { VideoClipDetailsDialog } from "@/app/_components/dashboard/VideoClipDetailsDialog";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => ({
  musicState: {
    error: null as string | null,
    hasUnsavedChanges: false,
    isMusicLoading: false,
    isSaving: false,
    music: null as CliprMusicMetadata | null,
    musicBlob: null as Blob | null,
    musicEnabled: true,
    musicVolume: 1,
    removeMusic: vi.fn(),
    saveMusic: vi.fn(),
    selectMusicTrack: vi.fn(),
    setMusicEnabled: vi.fn(),
    setMusicVolume: vi.fn(),
  },
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  useVideoClipDetailsMusic: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : typeof initialValue === "function"
          ? (initialValue as () => unknown)()
          : initialValue;
      const setState = vi.fn((nextValue: unknown) =>
        typeof nextValue === "function"
          ? (nextValue as (currentValue: unknown) => unknown)(value)
          : nextValue,
      );

      mocks.setStateCalls.push(setState);

      return [value, setState];
    },
  };
});

vi.mock("@/lib/clipstitchr/hooks/useVideoClipDetailsMusic", () => ({
  useVideoClipDetailsMusic: mocks.useVideoClipDetailsMusic,
}));

function findElements(
  value: unknown,
  predicate: (element: {
    props?: Record<string, unknown>;
    type?: unknown;
  }) => boolean,
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
  const matches = predicate(
    element as { props?: Record<string, unknown>; type?: unknown },
  )
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [...matches, ...findElements(element.props?.children, predicate)];
}

function createMusic(overrides: Partial<CliprMusicMetadata> = {}): CliprMusicMetadata {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "music.mp3",
      size: 100,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    enabled: true,
    prompt: "Upbeat",
    providerModel: "music-model",
    providerPredictionId: "prediction_1",
    title: "Launch Music",
    updatedAt: "2026-05-20T00:00:00.000Z",
    volume: 0.4,
    ...overrides,
  };
}

function createClip(overrides: Partial<VideoClipMetadata> = {}): VideoClipMetadata {
  return {
    aspectRatio: 9 / 16,
    clipType: "ugc",
    cliprMetadata: {
      avatarId: "avatar_1",
      avatarPhotoId: "photo_1",
      createdAt: "2026-05-20T00:00:00.000Z",
      finalDurationSeconds: 8,
      filledHook: "Stop scrolling",
      hookStyleKey: "direct",
      hookTemplateId: "hook_1",
      jobId: "job_1",
      music: createMusic(),
      productId: "product_1",
      productName: "Launch Kit",
      providerModels: ["model-a"],
      sceneCount: 2,
      script: "Script",
      targetDurationSeconds: 30,
      variablesUsed: {},
      voiceId: "voice_1",
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    locationDescription: "Studio",
    mainPersonDescription: "Person",
    mimeType: "video/mp4",
    name: "UGC Clip",
    originalName: "clip.mp4",
    originalSize: 100,
    outfitDescription: "Blue jacket",
    performanceScore: {
      bestUse: "Use it as the first UGC clip.",
      cameraPresence: 82,
      clarity: 80,
      fixes: ["Trim the pause at the start."],
      hook: 88,
      overall: 88,
      pacing: 76,
      platformFit: 84,
      stitchFit: 90,
      strengths: ["Clear face and product moment."],
      summary: "The first second gives people a reason to stay.",
    },
    poseDescription: "Holding product",
    productDescription: "Reusable launch kit",
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["ugc", "launch"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoDescription: "A product demo",
    videoObject: {
      contentType: "video/mp4",
      key: "clip.mp4",
      size: 100,
    },
    width: 1080,
    ...overrides,
  };
}

function createTrack(): SharedMusicTrack {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "shared.mp3",
      size: 100,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    id: "track_1",
    isOwnedByCurrentUser: false,
    mimeType: "audio/mpeg",
    size: 100,
    source: "library",
    tags: ["upbeat"],
    title: "Shared Track",
    uploadedByOwnerId: "user_1",
  };
}

describe("VideoClipDetailsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.musicState = {
      error: null,
      hasUnsavedChanges: false,
      isMusicLoading: false,
      isSaving: false,
      music: createMusic(),
      musicBlob: new Blob(["music"], { type: "audio/mpeg" }),
      musicEnabled: true,
      musicVolume: 0.4,
      removeMusic: vi.fn(async () => undefined),
      saveMusic: vi.fn(async () => undefined),
      selectMusicTrack: vi.fn(async () => undefined),
      setMusicEnabled: vi.fn(),
      setMusicVolume: vi.fn(),
    };
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    mocks.useVideoClipDetailsMusic.mockImplementation(() => mocks.musicState);
  });

  it("wires details, preview, trim, music controls, and close behavior", async () => {
    const onClose = vi.fn();
    const onLoadPreview = vi.fn();
    const onSaveTrim = vi.fn(async () => undefined);

    mocks.stateQueue = [
      { start: 1, end: 5 },
      { start: 1, end: 5 },
      [],
      [],
      true,
    ];

    const tree = VideoClipDetailsDialog({
      clip: createClip(),
      initialControlsEditorOpen: true,
      isLoading: false,
      musicEditor: {
        error: null,
        isSaving: false,
        onRemove: vi.fn(async () => undefined),
        onSave: vi.fn(async () => undefined),
      },
      onClose,
      onLoadPreview,
      posterUrl: "poster.jpg",
      productName: "Linked Product",
      trimEditor: {
        initialTrimRange: { start: 1, end: 5 },
        onSave: onSaveTrim,
        saveLabel: "Save trim",
        title: "Trim clip",
      },
      videoUrl: "clip.mp4",
    });
    const root = findElements(
      tree,
      (element) =>
        element.type === "div" &&
        String(element.props?.className).includes(
          "dashboard-dialog-viewport",
        ),
    )[0];
    const dialog = findElements(
      tree,
      (element) => element.props?.role === "dialog",
    )[0];
    const iconButton = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "IconButton",
    )[0];
    const preview = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "VideoClipMusicPreview",
    )[0];
    const controlsButton = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "Button",
    )[0];
    const trimEditor = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "VideoTrimEditor",
    )[0];
    const musicControls = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "CliprMusicControls",
    )[0];
    const scoreDetails = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "ClipPerformanceScoreDetails",
    )[0];
    const stopPropagation = vi.fn();

    (root.props.onClick as () => void)();
    (dialog.props.onClick as (event: { stopPropagation: () => void }) => void)({
      stopPropagation,
    });
    (iconButton.props.onClick as () => void)();
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(stopPropagation).toHaveBeenCalledOnce();

    expect(preview.props.trimRange).toEqual({ start: 1, end: 5 });
    expect(scoreDetails.props.score).toEqual(
      expect.objectContaining({ overall: 88 }),
    );
    (preview.props.onLoadPreview as () => void)();
    expect(onLoadPreview).toHaveBeenCalledOnce();

    expect(controlsButton.props.children).toBe("Trim & music");
    (controlsButton.props.onClick as () => void)();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith({ start: 1, end: 5 });
    expect(mocks.setStateCalls[2]).toHaveBeenCalledWith([]);
    expect(mocks.setStateCalls[4]).toHaveReturnedWith(false);

    (trimEditor.props.onCancel as () => void)();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith({ start: 1, end: 5 });
    expect(mocks.setStateCalls[2]).toHaveBeenCalledWith([]);
    (trimEditor.props.onChange as (range: { start: number; end: number }) => void)(
      { start: 2, end: 4 },
    );
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith({ start: 2, end: 4 });

    await (trimEditor.props.onSave as (range: {
      start: number;
      end: number;
    }) => Promise<void>)({ start: -10, end: 99 });
    expect(onSaveTrim).toHaveBeenCalledWith({ start: 0, end: 8 });
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith({ start: 0, end: 8 });
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith({ start: 0, end: 8 });

    (musicControls.props.onEnabledChange as (enabled: boolean) => void)(false);
    (musicControls.props.onVolumeChange as (volume: number) => void)(0.25);
    (musicControls.props.onRemove as () => void)();
    (musicControls.props.onSave as () => void)();
    (musicControls.props.onSelectTrack as (track: SharedMusicTrack) => void)(
      createTrack(),
    );
    await Promise.resolve();

    expect(mocks.musicState.setMusicEnabled).toHaveBeenCalledWith(false);
    expect(mocks.musicState.setMusicVolume).toHaveBeenCalledWith(0.25);
    expect(mocks.musicState.removeMusic).toHaveBeenCalledOnce();
    expect(mocks.musicState.saveMusic).toHaveBeenCalledOnce();
    expect(mocks.musicState.selectMusicTrack).toHaveBeenCalledWith(createTrack());
  });

  it("constrains long saved Swapr metadata inside the mobile dialog width", () => {
    const longToken = "swapr-output-" + "x".repeat(180);
    const tree = VideoClipDetailsDialog({
      clip: createClip({
        cliprMetadata: undefined,
        name: longToken,
        originalName: `users/user_123/video-clips/${longToken}/normalized.mp4`,
        tags: [longToken],
        videoDescription: longToken,
      }),
      isLoading: false,
      onClose: vi.fn(),
      onLoadPreview: vi.fn(),
      posterUrl: "poster.jpg",
      videoUrl: "clip.mp4",
    });
    const dialog = findElements(
      tree,
      (element) => element.props?.role === "dialog",
    )[0];
    const contentGrid = findElements(
      tree,
      (element) =>
        element.type === "div" &&
        String(element.props?.className).includes("grid min-w-0"),
    )[0];
    const titleText = findElements(
      tree,
      (element) =>
        element.type === "p" && element.props?.children === longToken,
    )[0];

    expect(dialog.props.className).toContain("overflow-x-hidden");
    expect(dialog.props.className).toContain("max-w-[calc(100vw-1rem)]");
    expect(contentGrid.props.className).toContain("min-w-0");
    expect(titleText.props.className).toContain("break-words");
  });

  it("wires the cut editor playhead to the clip preview", () => {
    mocks.stateQueue = [
      { start: 1, end: 7 },
      { start: 1, end: 7 },
      [{ end: 3, start: 2 }],
      [{ end: 3, start: 2 }],
      true,
      2,
      null,
    ];

    const tree = VideoClipDetailsDialog({
      clip: createClip({ duration: 8 }),
      cutEditor: {
        initialRemoveRanges: [{ end: 3, start: 2 }],
        onSave: vi.fn(async () => undefined),
      },
      initialControlsEditorOpen: true,
      isLoading: false,
      onClose: vi.fn(),
      onLoadPreview: vi.fn(),
      posterUrl: "poster.jpg",
      videoUrl: "clip.mp4",
    });
    const preview = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "VideoClipMusicPreview",
    )[0];
    const cutEditor = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "VideoCutEditor",
    )[0];

    expect(cutEditor.props.playheadSeconds).toBe(2);
    expect(preview.props.seekRequest).toBeNull();

    (cutEditor.props.onSeek as (seconds: number) => void)(4);
    expect(mocks.setStateCalls[5]).toHaveBeenCalledWith(4);
    expect(mocks.setStateCalls[6]).toHaveReturnedWith({
      id: 1,
      seconds: 4,
    });

    (preview.props.onSourceTimeChange as (seconds: number) => void)(6);
    expect(mocks.setStateCalls[5]).toHaveBeenCalledWith(6);
  });

  it("handles trim-only, music-only, and missing editor states", () => {
    mocks.musicState = {
      ...mocks.musicState,
      music: createMusic({ enabled: false }),
      musicEnabled: false,
    };

    mocks.stateQueue = [
      { start: 0, end: 8 },
      { start: 0, end: 8 },
      [],
      [],
      false,
    ];
    const trimOnlyTree = VideoClipDetailsDialog({
      clip: createClip({ hasAudio: false }),
      isLoading: true,
      onClose: vi.fn(),
      onLoadPreview: vi.fn(),
      posterUrl: null,
      trimEditor: {
        initialTrimRange: { start: 0, end: 8 },
        onSave: vi.fn(),
        saveLabel: "Save",
        title: "Trim",
      },
      videoUrl: null,
    });

    expect(
      findElements(
        trimOnlyTree,
        (element) =>
          typeof element.type === "function" && element.type.name === "Button",
      )[0].props.children,
    ).toBe("Trim");

    mocks.stateQueue = [
      { start: 0, end: 8 },
      { start: 0, end: 8 },
      [],
      [],
      false,
    ];
    const musicOnlyTree = VideoClipDetailsDialog({
      clip: createClip(),
      isLoading: false,
      musicEditor: {
        error: "Music error",
        isSaving: true,
        onRemove: vi.fn(async () => undefined),
        onSave: vi.fn(async () => undefined),
      },
      onClose: vi.fn(),
      onLoadPreview: vi.fn(),
      posterUrl: null,
      videoUrl: null,
    });

    expect(
      findElements(
        musicOnlyTree,
        (element) =>
          typeof element.type === "function" && element.type.name === "Button",
      )[0].props.children,
    ).toBe("Music");

    mocks.musicState = {
      ...mocks.musicState,
      music: null,
      musicEnabled: true,
    };
    mocks.stateQueue = [
      { start: 0, end: 8 },
      { start: 0, end: 8 },
      [],
      [],
      false,
    ];
    const detailsOnlyTree = VideoClipDetailsDialog({
      clip: createClip({ cliprMetadata: undefined, tags: undefined }),
      isLoading: false,
      onClose: vi.fn(),
      onLoadPreview: vi.fn(),
      posterUrl: null,
      videoUrl: null,
    });

    expect(
      findElements(
        detailsOnlyTree,
        (element) =>
          typeof element.type === "function" && element.type.name === "Button",
      ),
    ).toHaveLength(0);
  });
});
