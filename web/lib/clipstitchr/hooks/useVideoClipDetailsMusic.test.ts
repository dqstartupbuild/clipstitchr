import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVideoClipDetailsMusic } from "@/lib/clipstitchr/hooks/useVideoClipDetailsMusic";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => ({
  downloadMusicBlob: vi.fn(),
  useEffect: vi.fn((effect: () => void | (() => void)) => effect()),
  useStateSetter: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useEffect: mocks.useEffect,
  useMemo: (callback: () => unknown) => callback(),
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.useStateSetter,
  ],
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadMusicBlob", () => ({
  downloadMusicBlob: mocks.downloadMusicBlob,
}));

function createMusic(overrides: Record<string, unknown> = {}) {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "users/user_123/music/clipr.mp3",
      size: 20,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    enabled: true,
    prompt: "music",
    providerModel: "model",
    providerPredictionId: "prediction_1",
    title: "Music",
    updatedAt: "2026-05-20T00:00:00.000Z",
    volume: 0.6,
    ...overrides,
  };
}

function createClip(overrides: Record<string, unknown> = {}) {
  return {
    aspectRatio: 9 / 16,
    clipType: "ugc",
    cliprMetadata: {
      music: createMusic(),
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 12,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "Clip",
    originalName: "clip.mp4",
    originalSize: 100,
    sourceMimeType: "video/mp4",
    size: 100,
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_123/clips/clip_1.mp4",
      size: 100,
    },
    width: 1080,
    ...overrides,
  } as unknown as VideoClipMetadata;
}

function createSharedTrack() {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "shared/music/track.mp3",
      size: 20,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 24,
    id: "track_1",
    isOwnedByCurrentUser: false,
    mimeType: "audio/mpeg",
    ownerAudioObject: {
      contentType: "audio/mpeg",
      key: "users/user_123/music/track.mp3",
      size: 20,
    },
    prompt: "shared prompt",
    providerModel: "shared-model",
    providerPredictionId: "shared_prediction",
    source: "library" as const,
    size: 20,
    tags: ["shared"],
    title: "Shared Track",
    uploadedByOwnerId: "owner_123",
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("useVideoClipDetailsMusic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.downloadMusicBlob.mockResolvedValue(
      new Blob(["music"], { type: "audio/mpeg" }),
    );
  });

  it("downloads the current music preview blob", async () => {
    const state = useVideoClipDetailsMusic({
      clip: createClip(),
    });

    await flushPromises();

    expect(state.music).toEqual(expect.objectContaining({ title: "Music" }));
    expect(mocks.downloadMusicBlob).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Music" }),
    );
    expect(mocks.useStateSetter).toHaveBeenCalledWith({
      blob: expect.any(Blob),
      key: "users/user_123/music/clipr.mp3",
    });
    expect(mocks.useStateSetter).toHaveBeenCalledWith(false);
  });

  it("clears preview state when a clip has no music", async () => {
    const state = useVideoClipDetailsMusic({
      clip: createClip({ cliprMetadata: undefined }),
    });

    await flushPromises();

    expect(state.music).toBeNull();
    expect(mocks.downloadMusicBlob).not.toHaveBeenCalled();
    expect(mocks.useStateSetter).toHaveBeenCalledWith(null);
    expect(mocks.useStateSetter).toHaveBeenCalledWith(false);
  });

  it("stores preview load errors", async () => {
    mocks.downloadMusicBlob.mockRejectedValueOnce(new Error("download failed"));

    useVideoClipDetailsMusic({
      clip: createClip(),
    });
    await flushPromises();

    expect(mocks.useStateSetter).toHaveBeenCalledWith("download failed");
    expect(mocks.useStateSetter).toHaveBeenCalledWith(false);
  });

  it("generates, removes, and selects music as local draft changes", async () => {
    const editor = {
      error: "editor error",
      isGenerating: true,
      isSaving: true,
      onGenerate: vi.fn(async () =>
        createMusic({
          enabled: false,
          title: "Generated",
          volume: 0.4,
        }),
      ),
      onRemove: vi.fn(async () => undefined),
      onSave: vi.fn(async () => undefined),
    };
    const state = useVideoClipDetailsMusic({
      clip: createClip(),
      musicEditor: editor,
    });

    await state.generateMusic();
    await state.saveMusic();
    await state.removeMusic();
    await state.selectMusicTrack(createSharedTrack());

    expect(state.error).toBe("editor error");
    expect(state.isGenerating).toBe(true);
    expect(state.isSaving).toBe(true);
    expect(editor.onGenerate).toHaveBeenCalledTimes(1);
    expect(editor.onRemove).not.toHaveBeenCalled();
    expect(editor.onSave).not.toHaveBeenCalled();
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Generated",
      }),
    );
    expect(mocks.useStateSetter).toHaveBeenCalledWith(null);
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      expect.objectContaining({
        audioObject: expect.objectContaining({
          key: "users/user_123/music/track.mp3",
        }),
        providerModel: "shared-model",
        sharedTrackId: "track_1",
        title: "Shared Track",
      }),
    );
  });

  it("ignores editor commands when no editor is available", async () => {
    const stateWithoutEditor = useVideoClipDetailsMusic({
      clip: createClip(),
    });

    await stateWithoutEditor.generateMusic();
    await stateWithoutEditor.removeMusic();
    await stateWithoutEditor.saveMusic();
    await stateWithoutEditor.selectMusicTrack(createSharedTrack());

    expect(mocks.useStateSetter).toHaveBeenCalledWith(null);
  });
});
