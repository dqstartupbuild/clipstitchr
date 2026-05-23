import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLongr } from "@/lib/clipstitchr/hooks/useLongr";
import type { LongrBuildClipSelection } from "@/lib/clipstitchr/types/LongrBuildClipSelection";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => {
  const mutationFns = new Map<string, ReturnType<typeof vi.fn>>();

  return {
    createId: vi.fn(),
    createVideoPosterBlob: vi.fn(),
    downloadMusicTrackBlobFromR2: vi.fn(),
    getLongrVideoName: vi.fn(),
    mutationFns,
    stitchLongrSequence: vi.fn(),
    uploadBlobsToR2: vi.fn(),
    useMutation: vi.fn((mutationId: string) => {
      const mutation = mutationFns.get(mutationId) ?? vi.fn();

      mutationFns.set(mutationId, mutation);
      return mutation;
    }),
    useStateSetter: vi.fn(),
  };
});

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.useStateSetter,
  ],
}));

vi.mock("convex/react", () => ({
  useMutation: mocks.useMutation,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    longrVideos: {
      save: "longrVideos.save",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/client/r2/downloadMusicTrackBlobFromR2",
  () => ({
    downloadMusicTrackBlobFromR2:
      mocks.downloadMusicTrackBlobFromR2,
  }),
);

vi.mock("@/lib/clipstitchr/client/r2/uploadBlobsToR2", () => ({
  uploadBlobsToR2: mocks.uploadBlobsToR2,
}));

vi.mock("@/lib/clipstitchr/media/createVideoPosterBlob", () => ({
  createVideoPosterBlob: mocks.createVideoPosterBlob,
}));

vi.mock("@/lib/clipstitchr/media/stitchLongrSequence", () => ({
  stitchLongrSequence: mocks.stitchLongrSequence,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

vi.mock("@/lib/clipstitchr/utils/getLongrVideoName", () => ({
  getLongrVideoName: mocks.getLongrVideoName,
}));

function getMutation(id: string) {
  const mutation = mocks.mutationFns.get(id);

  if (!mutation) {
    throw new Error(`Missing mocked mutation ${id}.`);
  }

  return mutation;
}

function createClip(id = "clip_1", duration = 20) {
  return {
    aspectRatio: 9 / 16,
    blob: new Blob(["video"], { type: "video/mp4" }),
    clipType: "ugc" as const,
    createdAt: "2026-05-20T00:00:00.000Z",
    duration,
    hasAudio: true,
    height: 1920,
    id,
    mimeType: "video/mp4",
    name: `Clip ${id}`,
    originalName: `${id}.mp4`,
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["ugc"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: `users/user_123/clips/${id}.mp4`,
      size: 100,
    },
    width: 1080,
  } as unknown as VideoClip;
}

function createSelection(id = "clip_1", duration = 20) {
  const clip = createClip(id, duration);

  return {
    clip,
    loadClip: vi.fn(async () => clip) as unknown as LongrBuildClipSelection["loadClip"],
    trimRange: { end: duration, start: 0 },
  } as unknown as LongrBuildClipSelection;
}

function createMusicClip() {
  return {
    durationSeconds: 12,
    id: "music_clip_1",
    sourceEndSeconds: 12,
    sourceStartSeconds: 0,
    timelineStartSeconds: 2,
    trackId: "track_1",
    trackTitle: "Track",
    volume: 0.4,
  };
}

describe("useLongr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutationFns.clear();
    mocks.createId.mockReturnValue("longr_1");
    mocks.createVideoPosterBlob.mockResolvedValue(
      new Blob(["poster"], { type: "image/jpeg" }),
    );
    mocks.downloadMusicTrackBlobFromR2.mockResolvedValue(
      new Blob(["music"], { type: "audio/mpeg" }),
    );
    mocks.getLongrVideoName.mockReturnValue("Longr Video");
    mocks.stitchLongrSequence.mockResolvedValue({
      blob: new Blob(["stitched"], { type: "video/mp4" }),
      duration: 40,
      mimeType: "video/mp4",
    });
    mocks.uploadBlobsToR2.mockResolvedValue([
      {
        contentType: "video/mp4",
        key: "users/user_123/longr/longr_1.mp4",
        size: 100,
      },
      {
        contentType: "image/jpeg",
        key: "users/user_123/longr/longr_1.jpg",
        size: 10,
      },
    ]);
  });

  it("rejects empty selections before loading media", async () => {
    const state = useLongr({});

    await expect(state.buildLongrVideo([])).resolves.toBeNull();

    expect(mocks.stitchLongrSequence).not.toHaveBeenCalled();
    expect(mocks.useStateSetter).toHaveBeenCalledWith("error");
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Select at least one clip before building Longr.",
    );
  });

  it("stitches selected clips, downloads music, uploads outputs, and saves metadata", async () => {
    const onCreated = vi.fn();
    const state = useLongr({ onCreated });
    const musicClip = createMusicClip();

    await expect(
      state.buildLongrVideo(
        [createSelection("clip_1", 18), createSelection("clip_2", 22)],
        [musicClip],
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "longr_1",
        name: "Longr Video",
        posterObject: expect.objectContaining({
          key: "users/user_123/longr/longr_1.jpg",
        }),
      }),
    );

    expect(mocks.downloadMusicTrackBlobFromR2).toHaveBeenCalledWith("track_1");
    expect(mocks.stitchLongrSequence).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          clip: expect.objectContaining({ id: "clip_1" }),
          playbackRate: 1,
        }),
        expect.objectContaining({
          clip: expect.objectContaining({ id: "clip_2" }),
          playbackRate: 1,
        }),
      ],
      {
        musicClips: [
          expect.objectContaining({
            blob: expect.any(Blob),
            trackId: "track_1",
          }),
        ],
        onProgress: expect.any(Function),
      },
    );
    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      expect.objectContaining({ kind: "longr-video", recordId: "longr_1" }),
      expect.objectContaining({ kind: "longr-poster", recordId: "longr_1" }),
    ]);
    expect(getMutation("longrVideos.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        clipSegments: [
          expect.objectContaining({
            clipId: "clip_1",
            duration: 18,
            order: 0,
            playbackRate: 1,
          }),
          expect.objectContaining({
            clipId: "clip_2",
            duration: 22,
            order: 1,
            playbackRate: 1,
          }),
        ],
        duration: 40,
        id: "longr_1",
        musicClips: [musicClip],
        name: "Longr Video",
        posterObject: expect.objectContaining({
          key: "users/user_123/longr/longr_1.jpg",
        }),
      }),
    );
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(mocks.useStateSetter).toHaveBeenCalledWith("complete");
  });

  it("saves without a poster when poster generation fails", async () => {
    mocks.createVideoPosterBlob.mockRejectedValueOnce(new Error("no poster"));
    mocks.uploadBlobsToR2.mockResolvedValueOnce([
      {
        contentType: "video/mp4",
        key: "users/user_123/longr/longr_1.mp4",
        size: 100,
      },
    ]);
    const state = useLongr({});

    await expect(
      state.buildLongrVideo([createSelection("clip_1", 12)]),
    ).resolves.toEqual(
      expect.objectContaining({
        posterObject: undefined,
        posterVersion: undefined,
      }),
    );

    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      expect.objectContaining({ kind: "longr-video", recordId: "longr_1" }),
    ]);
  });

  it("reports load failures and overlong sequences", async () => {
    const missingSelection = createSelection("missing", 12);
    const missingLoadClip = missingSelection.loadClip as unknown as ReturnType<
      typeof vi.fn
    >;

    missingLoadClip.mockResolvedValueOnce(null);
    const state = useLongr({});

    await expect(
      state.buildLongrVideo([missingSelection]),
    ).resolves.toBeNull();
    await expect(
      state.buildLongrVideo([createSelection("clip_1", 301)]),
    ).resolves.toBeNull();

    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Unable to load Clip missing.",
    );
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Longs cannot be longer than 5 minutes.",
    );
  });
});
