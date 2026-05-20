import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStitchExportBlob } from "@/lib/clipstitchr/client/createStitchExportBlob";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";

const mocks = vi.hoisted(() => ({
  createVideoBlobWithPosterMetadata: vi.fn(),
  downloadBlobFromR2: vi.fn(),
  downloadMusicBlob: vi.fn(),
  renderCliprVideoWithMusic: vi.fn(),
  renderSavedStitchBlob: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/renderSavedStitchBlob", () => ({
  renderSavedStitchBlob: mocks.renderSavedStitchBlob,
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadMusicBlob", () => ({
  downloadMusicBlob: mocks.downloadMusicBlob,
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadBlobFromR2", () => ({
  downloadBlobFromR2: mocks.downloadBlobFromR2,
}));

vi.mock("@/lib/clipstitchr/media/createVideoBlobWithPosterMetadata", () => ({
  createVideoBlobWithPosterMetadata: mocks.createVideoBlobWithPosterMetadata,
}));

vi.mock("@/lib/clipstitchr/media/renderCliprVideoWithMusic", () => ({
  renderCliprVideoWithMusic: mocks.renderCliprVideoWithMusic,
}));

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    duration: 10,
    id: "stitch_1",
    includeDemoAudio: true,
    includeUgcAudio: true,
    name: "Stitch",
    size: 100,
    ugcClipId: "ugc_1",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  } as Stitch;
}

function createStitchMusic(
  overrides: Partial<StitchMusicMetadata> = {},
): StitchMusicMetadata {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "music.mp3",
      size: 10,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    enabled: true,
    prompt: "Upbeat stitch music",
    providerModel: "music-model",
    providerPredictionId: "prediction_1",
    title: "Music",
    updatedAt: "2026-05-20T00:00:00.000Z",
    volume: 0.75,
    ...overrides,
  };
}

describe("createStitchExportBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.renderSavedStitchBlob.mockResolvedValue(
      new Blob(["rendered"], { type: "video/mp4" }),
    );
    mocks.downloadBlobFromR2.mockResolvedValue(
      new Blob(["r2"], { type: "video/mp4" }),
    );
    mocks.downloadMusicBlob.mockResolvedValue(
      new Blob(["music"], { type: "audio/mpeg" }),
    );
    mocks.renderCliprVideoWithMusic.mockResolvedValue({
      blob: new Blob(["music-video"], { type: "video/mp4" }),
    });
    mocks.createVideoBlobWithPosterMetadata.mockResolvedValue(
      new Blob(["poster"], { type: "video/mp4" }),
    );
  });

  it("renders saved stitches, applies music, and writes poster metadata", async () => {
    const stitch = createStitch({
      music: createStitchMusic(),
      posterBlob: new Blob(["poster"], { type: "image/jpeg" }),
    });
    const loadClip = vi.fn();
    const onProgress = vi.fn();

    await expect(
      createStitchExportBlob(stitch, { loadClip, onProgress }),
    ).resolves.toEqual(expect.any(Blob));

    expect(mocks.renderSavedStitchBlob).toHaveBeenCalledWith({
      loadClip,
      onProgress,
      stitch,
    });
    expect(mocks.downloadMusicBlob).toHaveBeenCalledWith(stitch.music);
    expect(mocks.renderCliprVideoWithMusic).toHaveBeenCalledWith(
      expect.objectContaining({
        volume: 0.75,
      }),
    );
    expect(mocks.createVideoBlobWithPosterMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        posterBlob: stitch.posterBlob,
        title: "Stitch",
      }),
    );
  });

  it("falls back to stored stitch blobs or R2 objects when rendering fails", async () => {
    const storedBlob = new Blob(["stored"], { type: "video/mp4" });

    mocks.renderSavedStitchBlob.mockRejectedValue(new Error("Missing source"));

    await expect(
      createStitchExportBlob(
        createStitch({
          blob: storedBlob,
        }),
        {
          loadClip: vi.fn(),
          includePosterMetadata: false,
        },
      ),
    ).resolves.toBe(storedBlob);

    await expect(
      createStitchExportBlob(
        createStitch({
          stitchObject: {
            contentType: "video/mp4",
            key: "stitches/stitch_1.mp4",
            size: 100,
          },
        }),
        {
          loadClip: vi.fn(),
          includePosterMetadata: false,
        },
      ),
    ).resolves.toEqual(expect.any(Blob));
    expect(mocks.downloadBlobFromR2).toHaveBeenCalledWith({
      contentType: "video/mp4",
      key: "stitches/stitch_1.mp4",
      size: 100,
    });
  });

  it("throws when no export source is available", async () => {
    mocks.renderSavedStitchBlob.mockRejectedValue(new Error("Missing source"));

    await expect(
      createStitchExportBlob(createStitch(), {
        loadClip: vi.fn(),
      }),
    ).rejects.toThrow("Missing source");

    await expect(createStitchExportBlob(createStitch())).rejects.toThrow(
      "Unable to load the source videos for this stitch.",
    );
  });
});
