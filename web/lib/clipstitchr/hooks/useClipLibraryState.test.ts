import { beforeEach, describe, expect, it, vi } from "vitest";
import { useClipLibraryState } from "@/lib/clipstitchr/hooks/useClipLibraryState";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => {
  const mutationFns = new Map<string, ReturnType<typeof vi.fn>>();

  return {
    convex: {
      query: vi.fn(),
    },
    createStitchFromConvexDocument: vi.fn(),
    createStitchPosterBlob: vi.fn(),
    createVideoClipFromConvexDocument: vi.fn(),
    createVideoClipMetadataFromConvexDocument: vi.fn(),
    deleteObjectsFromR2: vi.fn(),
    downloadCachedR2ImageBlobs: vi.fn(),
    downloadBlobFromR2: vi.fn(),
    generateCliprMusic: vi.fn(),
    generateStitchMusic: vi.fn(),
    mutationFns,
    useConvex: vi.fn(),
    useConvexAuth: vi.fn(),
    useMutation: vi.fn((mutationId: string) => {
      const mutation = mutationFns.get(mutationId) ?? vi.fn();

      mutationFns.set(mutationId, mutation);
      return mutation;
    }),
    usePaginatedQuery: vi.fn(),
    useQuery: vi.fn(),
    useStateSetter: vi.fn(),
    uploadBlobsToR2: vi.fn(),
  };
});

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useMemo: (callback: () => unknown) => callback(),
  useRef: (value: unknown) => ({ current: value }),
  useState: (initialValue: unknown) => {
    const value =
      typeof initialValue === "function"
        ? (initialValue as () => unknown)()
        : initialValue;

    return [
      value,
      (nextValue: unknown) => {
        mocks.useStateSetter(nextValue);

        if (typeof nextValue === "function") {
          return (nextValue as (currentValue: unknown) => unknown)(value);
        }

        return nextValue;
      },
    ];
  },
}));

vi.mock("convex/react", () => ({
  useConvex: mocks.useConvex,
  useConvexAuth: mocks.useConvexAuth,
  useMutation: mocks.useMutation,
  usePaginatedQuery: mocks.usePaginatedQuery,
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    libraryCounts: {
      get: "libraryCounts.get",
    },
    stitches: {
      get: "stitches.get",
      list: "stitches.list",
      remove: "stitches.remove",
      updateMusic: "stitches.updateMusic",
      updatePostedStatus: "stitches.updatePostedStatus",
      updatePoster: "stitches.updatePoster",
      updateSourceSettings: "stitches.updateSourceSettings",
      updateTextOverlay: "stitches.updateTextOverlay",
    },
    videoClips: {
      get: "videoClips.get",
      list: "videoClips.list",
      listByLibraryKind: "videoClips.listByLibraryKind",
      remove: "videoClips.remove",
      updateCliprMusic: "videoClips.updateCliprMusic",
      updateMetadata: "videoClips.updateMetadata",
    },
  },
}));

vi.mock("@/lib/clipstitchr/backend/createStitchFromConvexDocument", () => ({
  createStitchFromConvexDocument: mocks.createStitchFromConvexDocument,
}));

vi.mock("@/lib/clipstitchr/backend/createVideoClipFromConvexDocument", () => ({
  createVideoClipFromConvexDocument: mocks.createVideoClipFromConvexDocument,
}));

vi.mock(
  "@/lib/clipstitchr/backend/createVideoClipMetadataFromConvexDocument",
  () => ({
    createVideoClipMetadataFromConvexDocument:
      mocks.createVideoClipMetadataFromConvexDocument,
  }),
);

vi.mock("@/lib/clipstitchr/client/r2/deleteObjectsFromR2", () => ({
  deleteObjectsFromR2: mocks.deleteObjectsFromR2,
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs", () => ({
  downloadCachedR2ImageBlobs: mocks.downloadCachedR2ImageBlobs,
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadBlobFromR2", () => ({
  downloadBlobFromR2: mocks.downloadBlobFromR2,
}));

vi.mock("@/lib/clipstitchr/client/r2/uploadBlobsToR2", () => ({
  uploadBlobsToR2: mocks.uploadBlobsToR2,
}));

vi.mock("@/lib/clipstitchr/client/generateCliprMusic", () => ({
  generateCliprMusic: mocks.generateCliprMusic,
}));

vi.mock("@/lib/clipstitchr/client/generateStitchMusic", () => ({
  generateStitchMusic: mocks.generateStitchMusic,
}));

vi.mock("@/lib/clipstitchr/media/createStitchPosterBlob", () => ({
  createStitchPosterBlob: mocks.createStitchPosterBlob,
}));

function getMutation(id: string) {
  const mutation = mocks.mutationFns.get(id);

  if (!mutation) {
    throw new Error(`Missing mocked mutation ${id}.`);
  }

  return mutation;
}

function createClipDocument(overrides: Record<string, unknown> = {}) {
  return {
    clipType: "ugc",
    cliprMetadata: {
      music: {
        audioObject: { key: "users/user_123/music/old-clipr.mp3" },
      },
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    defaultTrimRange: { end: 12, start: 0 },
    duration: 12,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "Clip",
    posterObject: { key: "users/user_123/clips/clip_1/poster.jpg" },
    size: 100,
    tags: ["ugc"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: { key: "users/user_123/clips/clip_1/video.mp4" },
    ...overrides,
  };
}

function createClipMetadata(overrides: Record<string, unknown> = {}) {
  return {
    ...createClipDocument(),
    posterBlob: new Blob(["poster"], { type: "image/jpeg" }),
    ...overrides,
  } as unknown as VideoClipMetadata;
}

function createStitch(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    id: "stitch_1",
    music: {
      audioObject: { key: "users/user_123/music/old-stitch.mp3" },
    },
    name: "Stitch",
    posterObject: { key: "users/user_123/stitches/stitch_1/poster.jpg" },
    stitchObject: { key: "users/user_123/stitches/stitch_1/video.mp4" },
    ugcClipId: "clip_1",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  } as unknown as Stitch;
}

describe("useClipLibraryState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutationFns.clear();
    mocks.useConvex.mockReturnValue(mocks.convex);
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mocks.usePaginatedQuery.mockImplementation(() => {
      return {
        isLoading: false,
        loadMore: vi.fn(),
        results: [],
        status: "Exhausted",
      };
    });
    mocks.useQuery.mockReturnValue({
      activeStitches: 0,
      cliprClips: 0,
      demoClips: 0,
      postedStitches: 0,
      stitches: 0,
      swapClips: 0,
      ugcClips: 0,
    });
    mocks.convex.query.mockImplementation(async (queryId: string) => {
      if (queryId === "videoClips.get") {
        return createClipDocument();
      }

      if (queryId === "stitches.get") {
        return createStitch();
      }

      return null;
    });
    mocks.deleteObjectsFromR2.mockResolvedValue(undefined);
    mocks.downloadBlobFromR2.mockResolvedValue(new Blob(["asset"], {
      type: "application/octet-stream",
    }));
    mocks.downloadCachedR2ImageBlobs.mockImplementation(async (objects) => {
      return new Map(
        objects.map((object: { key: string }) => [
          object.key,
          new Blob(["poster"], { type: "image/jpeg" }),
        ]),
      );
    });
    mocks.createStitchPosterBlob.mockResolvedValue(
      new Blob(["stitch-poster"], { type: "image/jpeg" }),
    );
    mocks.uploadBlobsToR2.mockResolvedValue([
      {
        contentType: "image/jpeg",
        key: "users/user_123/stitches/stitch_1/poster.jpg",
        size: 10,
      },
    ]);
    mocks.createVideoClipFromConvexDocument.mockReturnValue({
      id: "clip_1",
      name: "Loaded clip",
    });
    mocks.createVideoClipMetadataFromConvexDocument.mockReturnValue(
      createClipMetadata(),
    );
    mocks.createStitchFromConvexDocument.mockReturnValue({
      id: "stitch_1",
    });
    mocks.generateCliprMusic.mockResolvedValue({
      audioObject: { key: "users/user_123/music/new-clipr.mp3" },
      title: "Clipr Music",
    });
    mocks.generateStitchMusic.mockResolvedValue({
      audioObject: { key: "users/user_123/music/new-stitch.mp3" },
      title: "Stitch Music",
    });
  });

  it("skips library queries while signed out", () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const state = useClipLibraryState();

    expect(state.isLoading).toBe(false);
    expect(mocks.usePaginatedQuery).toHaveBeenCalledWith(
      "videoClips.list",
      "skip",
      { initialNumItems: 48 },
    );
    expect(mocks.usePaginatedQuery).toHaveBeenCalledWith(
      "videoClips.listByLibraryKind",
      "skip",
      { initialNumItems: 48 },
    );
    expect(mocks.usePaginatedQuery).toHaveBeenCalledWith(
      "stitches.list",
      "skip",
      { initialNumItems: 48 },
    );
    expect(mocks.useQuery).toHaveBeenCalledWith("libraryCounts.get", "skip");
  });

  it("loads a clip from Convex and R2 once, then reuses the cache", async () => {
    const state = useClipLibraryState();

    await expect(state.loadClip("clip_1")).resolves.toEqual({
      id: "clip_1",
      name: "Loaded clip",
    });
    await expect(state.loadClip("clip_1")).resolves.toEqual({
      id: "clip_1",
      name: "Loaded clip",
    });
    expect(mocks.convex.query).toHaveBeenCalledTimes(1);
    expect(mocks.downloadBlobFromR2).toHaveBeenCalledTimes(1);
    expect(mocks.downloadCachedR2ImageBlobs).toHaveBeenCalledWith([
      expect.objectContaining({
        key: "users/user_123/clips/clip_1/poster.jpg",
      }),
    ]);
    expect(mocks.createVideoClipFromConvexDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        blob: expect.any(Blob),
        posterBlob: expect.any(Blob),
      }),
    );
  });

  it("loads poster blobs through batching, pending requests, and cache hits", async () => {
    const state = useClipLibraryState();

    const [firstPoster, secondPoster] = await Promise.all([
      state.loadClipPoster("clip_1"),
      state.loadClipPoster("clip_1"),
    ]);
    const cachedPoster = await state.loadClipPoster("clip_1");

    expect(firstPoster).toBeInstanceOf(Blob);
    expect(secondPoster).toBe(firstPoster);
    expect(cachedPoster).toBe(firstPoster);
    expect(mocks.downloadCachedR2ImageBlobs).toHaveBeenCalledTimes(1);
  });

  it("loads listed documents and poster fallbacks", async () => {
    const clipWithoutPoster = createClipDocument({
      id: "clip_without_poster",
      posterObject: undefined,
    });
    mocks.usePaginatedQuery.mockImplementation((queryId: string, args) => ({
      isLoading: false,
      loadMore: vi.fn(),
      results:
        queryId === "videoClips.list"
          ? [
              createClipDocument(),
              createClipDocument({
                id: "clip_2",
                posterObject: {
                  key: "users/user_123/clips/clip_2/poster.jpg",
                },
              }),
              clipWithoutPoster,
            ]
          : queryId === "stitches.list" && args?.postedStatus === "active"
            ? [
                createStitch(),
                createStitch({
                  id: "stitch_2",
                  posterObject: undefined,
                  ugcClipId: "clip_2",
                }),
                createStitch({
                  id: "stitch_3",
                  posterObject: undefined,
                  ugcClipId: "clip_without_poster",
                }),
              ]
            : [],
      status: "Exhausted",
    }));
    const state = useClipLibraryState();

    const [firstPoster, secondPoster] = await Promise.all([
      state.loadClipPoster("clip_1"),
      state.loadClipPoster("clip_2"),
    ]);
    const clip = await state.loadClip("clip_1");
    const stitchPoster = await state.loadStitchPoster("stitch_1");
    const fallbackPoster = await state.loadStitchPoster("stitch_2");
    const missingFallbackPoster = await state.loadStitchPoster("stitch_3");

    expect(firstPoster).toBeInstanceOf(Blob);
    expect(secondPoster).toBeInstanceOf(Blob);
    expect(clip).toEqual({ id: "clip_1", name: "Loaded clip" });
    expect(stitchPoster).toBeInstanceOf(Blob);
    expect(fallbackPoster).toBeInstanceOf(Blob);
    expect(missingFallbackPoster).toBeNull();
    expect(mocks.convex.query).not.toHaveBeenCalled();
  });

  it("resolves poster loads to null when cached R2 downloads fail", async () => {
    mocks.downloadCachedR2ImageBlobs.mockRejectedValueOnce(
      new Error("R2 unavailable"),
    );
    const state = useClipLibraryState();

    await expect(state.loadClipPoster("clip_1")).resolves.toBeNull();
  });

  it("returns null for missing clip and stitch documents", async () => {
    mocks.convex.query.mockResolvedValue(null);
    const state = useClipLibraryState();

    await expect(state.loadClip("missing_clip")).resolves.toBeNull();
    await expect(state.loadClipPoster("missing_clip")).resolves.toBeNull();
    await expect(state.loadStitchPoster("missing_stitch")).resolves.toBeNull();
  });

  it("falls back to the UGC poster for stitches without their own poster", async () => {
    mocks.convex.query.mockImplementation(async (queryId: string) => {
      if (queryId === "stitches.get") {
        return createStitch({ posterObject: undefined });
      }

      if (queryId === "videoClips.get") {
        return createClipDocument();
      }

      return null;
    });
    const state = useClipLibraryState();

    await expect(state.loadStitchPoster("stitch_1")).resolves.toBeInstanceOf(
      Blob,
    );
    expect(mocks.convex.query).toHaveBeenCalledWith("videoClips.get", {
      id: "clip_1",
    });
  });

  it("updates clip metadata and clamps default trim ranges", async () => {
    const state = useClipLibraryState();
    const clip = createClipMetadata({ duration: 30 });

    await state.renameClip(clip, "Renamed");
    await state.updateClipMetadata(clip, {
      locationDescription: "Studio",
      name: "Updated",
      productId: "product_1",
      tags: ["demo"],
      videoDescription: "Talking head",
    });
    await state.updateClipTrimRange(clip, {
      end: 40,
      start: -5,
    });

    expect(getMutation("videoClips.updateMetadata")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "clip_1",
        name: "Renamed",
      }),
    );
    expect(getMutation("videoClips.updateMetadata")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "clip_1",
        locationDescription: "Studio",
        name: "Updated",
        productId: "product_1",
        tags: ["ugc", "demo"],
        videoDescription: "Talking head",
      }),
    );
    expect(getMutation("videoClips.updateMetadata")).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultTrimRange: { end: 30, start: 0 },
        id: "clip_1",
      }),
    );
  });

  it("updates clip metadata without optional description fields", async () => {
    const state = useClipLibraryState();

    await state.updateClipMetadata(createClipMetadata(), {
      name: "Minimal update",
      tags: [],
    });

    expect(getMutation("videoClips.updateMetadata")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "clip_1",
        name: "Minimal update",
        tags: ["ugc"],
      }),
    );
  });

  it("updates clip metadata with every optional description field", async () => {
    const state = useClipLibraryState();

    await state.updateClipMetadata(createClipMetadata(), {
      locationDescription: "Kitchen",
      mainPersonDescription: "Presenter",
      name: "Detailed update",
      outfitDescription: "Blue hoodie",
      poseDescription: "Pointing",
      productDescription: "Bottle",
      productId: "product_2",
      tags: ["demo"],
      videoDescription: "Walkthrough",
    });

    expect(getMutation("videoClips.updateMetadata")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "clip_1",
        locationDescription: "Kitchen",
        mainPersonDescription: "Presenter",
        outfitDescription: "Blue hoodie",
        poseDescription: "Pointing",
        productDescription: "Bottle",
        productId: "product_2",
        videoDescription: "Walkthrough",
      }),
    );
  });

  it("generates Clipr music drafts and saves replacements with owned-audio cleanup", async () => {
    const state = useClipLibraryState();
    const clip = createClipMetadata();
    const replacementMusic = {
      audioObject: { key: "users/user_123/music/replacement.mp3" },
      title: "Replacement",
    } as unknown as CliprMusicMetadata;

    await expect(state.generateCliprMusic(clip)).resolves.toEqual({
      audioObject: { key: "users/user_123/music/new-clipr.mp3" },
      title: "Clipr Music",
    });
    await state.updateCliprMusic(clip, replacementMusic);
    await state.updateCliprMusic(clip, null);

    expect(mocks.generateCliprMusic).toHaveBeenCalledWith({ clipId: "clip_1" });
    expect(getMutation("videoClips.updateCliprMusic")).not.toHaveBeenCalledWith(
      expect.objectContaining({
        music: expect.objectContaining({
          audioObject: { key: "users/user_123/music/new-clipr.mp3" },
        }),
      }),
    );
    expect(getMutation("videoClips.updateCliprMusic")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "clip_1",
        music: null,
      }),
    );
    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      { key: "users/user_123/music/old-clipr.mp3" },
    ]);
  });

  it("keeps Clipr music objects when the previous audio is shared or unchanged", async () => {
    const state = useClipLibraryState();
    const sharedClip = createClipMetadata({
      cliprMetadata: {
        music: {
          audioObject: { key: "shared/music/stock.mp3" },
        },
      },
    });
    const unchangedClip = createClipMetadata({
      cliprMetadata: {
        music: {
          audioObject: { key: "users/user_123/music/current.mp3" },
        },
      },
    });

    await state.updateCliprMusic(sharedClip, {
      audioObject: { key: "users/user_123/music/new.mp3" },
      title: "New",
    } as unknown as CliprMusicMetadata);
    await state.updateCliprMusic(unchangedClip, {
      audioObject: { key: "users/user_123/music/current.mp3" },
      title: "Current",
    } as unknown as CliprMusicMetadata);

    expect(mocks.deleteObjectsFromR2).not.toHaveBeenCalledWith([
      { key: "shared/music/stock.mp3" },
    ]);
    expect(mocks.deleteObjectsFromR2).not.toHaveBeenCalledWith([
      { key: "users/user_123/music/current.mp3" },
    ]);
  });

  it("swallows owned music cleanup failures after metadata updates", async () => {
    const state = useClipLibraryState();
    const clip = createClipMetadata();
    const stitch = createStitch({ duration: 12 });

    mocks.deleteObjectsFromR2.mockRejectedValueOnce(
      new Error("Clipr cleanup failed"),
    );
    await expect(state.updateCliprMusic(clip, null)).resolves.toBeUndefined();

    mocks.deleteObjectsFromR2.mockRejectedValueOnce(
      new Error("Stitch cleanup failed"),
    );
    await expect(state.updateStitchMusic(stitch, null)).resolves.toBeUndefined();
  });

  it("returns null when a clip has no Clipr metadata to generate against", async () => {
    const state = useClipLibraryState();

    await expect(
      state.generateCliprMusic(createClipMetadata({ cliprMetadata: undefined })),
    ).resolves.toBeNull();
    expect(mocks.generateCliprMusic).not.toHaveBeenCalled();
  });

  it("generates stitch music drafts and updates music and text overlays without poster work", async () => {
    const state = useClipLibraryState();
    const stitch = createStitch();
    const textOverlay = {
      backgroundColor: "#000000",
      color: "#ffffff",
      endTime: 5,
      fontSize: 48,
      startTime: 1,
      styleId: "hook",
      text: "Hook",
      width: 0.8,
      x: 0.5,
      y: 0.5,
    } satisfies TextOverlay;

    await expect(state.generateStitchMusic(stitch)).resolves.toEqual({
      audioObject: { key: "users/user_123/music/new-stitch.mp3" },
      title: "Stitch Music",
    });
    await state.updateStitchMusic(stitch, null);
    await state.updateStitchTextOverlay(stitch, textOverlay);
    await state.updateStitchPostedStatus(stitch, true);
    await state.removeStitch("stitch_1");

    expect(mocks.generateStitchMusic).toHaveBeenCalledWith({
      stitchId: "stitch_1",
    });
    expect(getMutation("stitches.updateMusic")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "stitch_1",
        music: null,
      }),
    );
    expect(getMutation("stitches.updateTextOverlay")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "stitch_1",
        textOverlay: expect.objectContaining({ text: textOverlay.text }),
        textOverlays: expect.arrayContaining([
          expect.objectContaining({ text: textOverlay.text }),
        ]),
      }),
    );
    expect(mocks.useMutation).not.toHaveBeenCalledWith("stitches.updatePoster");
    expect(getMutation("stitches.updatePostedStatus")).toHaveBeenCalledWith({
      id: "stitch_1",
      isPosted: true,
    });
    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      { key: "users/user_123/stitches/stitch_1/video.mp4" },
      { key: "users/user_123/stitches/stitch_1/poster.jpg" },
      { key: "users/user_123/music/old-stitch.mp3" },
    ]);
    expect(getMutation("stitches.remove")).toHaveBeenCalledWith({
      id: "stitch_1",
    });
  });

  it("updates stitch source settings with a regenerated poster", async () => {
    const state = useClipLibraryState();
    const stitch = createStitch({
      duration: 12,
      textOverlay: {
        endTime: 8,
        fontSize: 48,
        startTime: 0,
        styleId: "hook",
        text: "Hook",
        width: 0.8,
        x: 0.5,
        y: 0.5,
      },
    });
    const update = {
      demoClipId: "demo_2",
      demoClipName: "Demo 2",
      demoCropBounds: {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
      },
      demoPlaybackRate: 2,
      demoTrimRange: {
        end: 8,
        start: 2,
      },
      duration: 9,
      name: "updated-stitch.mp4",
      ugcClipId: "ugc_2",
      ugcClipName: "UGC 2",
      ugcCropBounds: {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
      },
      ugcPlaybackRate: 1,
      ugcTrimRange: {
        end: 3,
        start: 0,
      },
    } as const;

    await state.updateStitchSourceSettings(stitch, update);

    expect(mocks.createStitchPosterBlob).toHaveBeenCalledWith(
      expect.objectContaining({
        demoPlaybackRate: 2,
        demoTrimRange: update.demoTrimRange,
        duration: 9,
        ugcPlaybackRate: 1,
        ugcTrimRange: update.ugcTrimRange,
      }),
    );
    expect(getMutation("stitches.updateSourceSettings")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "stitch_1",
        ...update,
        posterObject: expect.objectContaining({
          key: "users/user_123/stitches/stitch_1/poster.jpg",
        }),
        posterVersion: 2,
      }),
    );
  });

  it("keeps stitch music when replacing shared or unchanged audio", async () => {
    const state = useClipLibraryState();
    const sharedStitch = createStitch({
      music: {
        audioObject: { key: "shared/music/stock.mp3" },
      },
    });
    const unchangedStitch = createStitch({
      music: {
        audioObject: { key: "users/user_123/music/current.mp3" },
      },
    });

    await state.updateStitchMusic(sharedStitch, {
      audioObject: { key: "users/user_123/music/new.mp3" },
      title: "New",
    } as unknown as StitchMusicMetadata);
    await state.updateStitchMusic(unchangedStitch, {
      audioObject: { key: "users/user_123/music/current.mp3" },
      title: "Current",
    } as unknown as StitchMusicMetadata);

    expect(mocks.deleteObjectsFromR2).not.toHaveBeenCalledWith([
      { key: "shared/music/stock.mp3" },
    ]);
    expect(mocks.deleteObjectsFromR2).not.toHaveBeenCalledWith([
      { key: "users/user_123/music/current.mp3" },
    ]);
  });

  it("removes metadata even when documents are already gone", async () => {
    mocks.convex.query.mockResolvedValue(null);
    const state = useClipLibraryState();

    await state.removeClip("missing_clip");
    await state.removeStitch("missing_stitch");

    expect(mocks.deleteObjectsFromR2).not.toHaveBeenCalled();
    expect(getMutation("videoClips.remove")).toHaveBeenCalledWith({
      id: "missing_clip",
    });
    expect(getMutation("stitches.remove")).toHaveBeenCalledWith({
      id: "missing_stitch",
    });
  });

  it("removes clip media from R2 before deleting metadata", async () => {
    const state = useClipLibraryState();

    await state.removeClip("clip_1");

    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      { key: "users/user_123/clips/clip_1/video.mp4" },
      { key: "users/user_123/clips/clip_1/poster.jpg" },
      { key: "users/user_123/music/old-clipr.mp3" },
    ]);
    expect(getMutation("videoClips.remove")).toHaveBeenCalledWith({
      id: "clip_1",
    });
  });

  it("removes listed documents and skips optional music object deletes", async () => {
    mocks.usePaginatedQuery.mockImplementation((queryId: string, args) => ({
      isLoading: false,
      loadMore: vi.fn(),
      results:
        queryId === "videoClips.list"
          ? [createClipDocument({ cliprMetadata: undefined })]
          : queryId === "stitches.list" && args?.postedStatus === "active"
            ? [createStitch({ music: undefined })]
            : [],
      status: "Exhausted",
    }));
    const state = useClipLibraryState();

    await state.removeClip("clip_1");
    await state.removeStitch("stitch_1");

    expect(mocks.convex.query).not.toHaveBeenCalled();
    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      { key: "users/user_123/clips/clip_1/video.mp4" },
      { key: "users/user_123/clips/clip_1/poster.jpg" },
    ]);
    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      { key: "users/user_123/stitches/stitch_1/video.mp4" },
      { key: "users/user_123/stitches/stitch_1/poster.jpg" },
    ]);
  });

  it("maps paginated metadata without downloading media blobs", () => {
    mocks.usePaginatedQuery.mockImplementation((queryId: string, args) => {
      if (queryId === "videoClips.list") {
        return {
          isLoading: false,
          loadMore: vi.fn(),
          results: [createClipDocument()],
          status: "Exhausted",
        };
      }

      if (queryId === "stitches.list") {
        return {
          isLoading: false,
          loadMore: vi.fn(),
          results: args?.postedStatus === "active" ? [createStitch()] : [],
          status: "Exhausted",
        };
      }

      return {
        isLoading: false,
        loadMore: vi.fn(),
        results: [],
        status: "Exhausted",
      };
    });

    const state = useClipLibraryState();

    expect(state.clips).toHaveLength(1);
    expect(state.counts).toEqual({
      activeStitches: 1,
      cliprClips: 1,
      demoClips: 0,
      postedStitches: 0,
      stitches: 1,
      swapClips: 0,
      ugcClips: 0,
    });
    expect(state.stitches).toEqual([{ id: "stitch_1" }]);
    expect(mocks.downloadBlobFromR2).not.toHaveBeenCalled();
    expect(mocks.downloadCachedR2ImageBlobs).not.toHaveBeenCalled();
    expect(mocks.createVideoClipMetadataFromConvexDocument).toHaveBeenCalled();
    expect(mocks.createStitchFromConvexDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        stitch: expect.objectContaining({ id: "stitch_1" }),
      }),
    );
  });

  it("uses aggregate counts when they are larger than the loaded page", () => {
    mocks.useQuery.mockReturnValue({
      activeStitches: 0,
      cliprClips: 10,
      demoClips: 20,
      postedStitches: 0,
      stitches: 40,
      swapClips: 50,
      ugcClips: 60,
    });
    mocks.usePaginatedQuery.mockImplementation((queryId: string) => {
      if (queryId === "videoClips.list") {
        return {
          isLoading: false,
          loadMore: vi.fn(),
          results: [createClipDocument()],
          status: "CanLoadMore",
        };
      }

      return {
        isLoading: false,
        loadMore: vi.fn(),
        results: [],
        status: "Exhausted",
      };
    });

    const state = useClipLibraryState();

    expect(state.counts).toEqual({
      activeStitches: 0,
      cliprClips: 10,
      demoClips: 20,
      postedStitches: 0,
      stitches: 40,
      swapClips: 50,
      ugcClips: 60,
    });
  });

  it("loads the next metadata page when available", () => {
    const loadMoreClips = vi.fn();
    const loadMoreStitches = vi.fn();

    mocks.usePaginatedQuery.mockImplementation((queryId: string) => ({
      isLoading: false,
      loadMore:
        queryId === "videoClips.list"
          ? loadMoreClips
          : loadMoreStitches,
      results: [],
      status: "CanLoadMore",
    }));

    const state = useClipLibraryState();

    expect(state.hasMoreClips).toBe(true);
    expect(state.hasMoreStitches).toBe(true);
    state.loadMoreClips();
    state.loadMoreStitches();

    expect(loadMoreClips).toHaveBeenCalledWith(48);
    expect(loadMoreStitches).toHaveBeenCalledWith(48);
  });

  it("ignores load-more requests when each paginated query is exhausted", () => {
    const loadMoreClips = vi.fn();
    const loadMoreStitches = vi.fn();

    mocks.usePaginatedQuery.mockImplementation((queryId: string) => ({
      isLoading: false,
      loadMore:
        queryId === "videoClips.list"
          ? loadMoreClips
          : loadMoreStitches,
      results: [],
      status: "Exhausted",
    }));

    const state = useClipLibraryState();

    state.loadMoreClips();
    state.loadMoreStitches();

    expect(loadMoreClips).not.toHaveBeenCalled();
    expect(loadMoreStitches).not.toHaveBeenCalled();
  });

  it("reports first-page and load-more loading states", () => {
    mocks.usePaginatedQuery.mockImplementation((queryId: string) => ({
      isLoading: false,
      loadMore: vi.fn(),
      results: [],
      status:
        queryId === "videoClips.list"
          ? "LoadingFirstPage"
          : "LoadingMore",
    }));

    const state = useClipLibraryState();

    expect(state.isLoading).toBe(true);
    expect(state.isLoadingMoreStitches).toBe(true);
  });

  it("returns empty metadata while signed out", () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    mocks.useQuery.mockReturnValue(undefined);

    const state = useClipLibraryState();

    expect(state.counts).toEqual({
      activeStitches: 0,
      cliprClips: 0,
      demoClips: 0,
      postedStitches: 0,
      stitches: 0,
      swapClips: 0,
      ugcClips: 0,
    });
    expect(state.clips).toEqual([]);
    expect(state.stitches).toEqual([]);
  });
});
