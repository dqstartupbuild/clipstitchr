import { beforeEach, describe, expect, it, vi } from "vitest";
import { useClipLibraryState } from "@/lib/clipstitchr/hooks/useClipLibraryState";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => {
  const mutationFns = new Map<string, ReturnType<typeof vi.fn>>();

  return {
    convex: {
      query: vi.fn(),
    },
    createLongrVideoFromConvexDocument: vi.fn(),
    createStitchFromConvexDocument: vi.fn(),
    createVideoClipFromConvexDocument: vi.fn(),
    createVideoClipMetadataFromConvexDocument: vi.fn(),
    deleteObjectsFromR2: vi.fn(),
    downloadBlobFromR2: vi.fn(),
    generateCliprMusic: vi.fn(),
    generateStitchMusic: vi.fn(),
    mutationFns,
    useConvex: vi.fn(),
    useConvexAuth: vi.fn(),
    useEffect: vi.fn(),
    useMutation: vi.fn((mutationId: string) => {
      const mutation = mutationFns.get(mutationId) ?? vi.fn();

      mutationFns.set(mutationId, mutation);
      return mutation;
    }),
    useQuery: vi.fn(),
    useStateSetter: vi.fn(),
  };
});

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useEffect: mocks.useEffect,
  useRef: (value: unknown) => ({ current: value }),
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.useStateSetter,
  ],
}));

vi.mock("convex/react", () => ({
  useConvex: mocks.useConvex,
  useConvexAuth: mocks.useConvexAuth,
  useMutation: mocks.useMutation,
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    longrVideos: {
      get: "longrVideos.get",
      list: "longrVideos.list",
      remove: "longrVideos.remove",
    },
    stitches: {
      get: "stitches.get",
      list: "stitches.list",
      remove: "stitches.remove",
      updateMusic: "stitches.updateMusic",
      updateTextOverlay: "stitches.updateTextOverlay",
    },
    videoClips: {
      get: "videoClips.get",
      list: "videoClips.list",
      remove: "videoClips.remove",
      updateCliprMusic: "videoClips.updateCliprMusic",
      updateMetadata: "videoClips.updateMetadata",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/backend/createLongrVideoFromConvexDocument",
  () => ({
    createLongrVideoFromConvexDocument:
      mocks.createLongrVideoFromConvexDocument,
  }),
);

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

vi.mock("@/lib/clipstitchr/client/r2/downloadBlobFromR2", () => ({
  downloadBlobFromR2: mocks.downloadBlobFromR2,
}));

vi.mock("@/lib/clipstitchr/client/generateCliprMusic", () => ({
  generateCliprMusic: mocks.generateCliprMusic,
}));

vi.mock("@/lib/clipstitchr/client/generateStitchMusic", () => ({
  generateStitchMusic: mocks.generateStitchMusic,
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

function createLongrVideo(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "longr_1",
    longrObject: { key: "users/user_123/longr/longr_1/video.mp4" },
    name: "Longr",
    posterObject: { key: "users/user_123/longr/longr_1/poster.jpg" },
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
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
    mocks.useQuery.mockImplementation((queryId: string) => {
      if (
        queryId === "videoClips.list" ||
        queryId === "stitches.list" ||
        queryId === "longrVideos.list"
      ) {
        return [];
      }

      return undefined;
    });
    mocks.convex.query.mockImplementation(async (queryId: string) => {
      if (queryId === "videoClips.get") {
        return createClipDocument();
      }

      if (queryId === "stitches.get") {
        return createStitch();
      }

      if (queryId === "longrVideos.get") {
        return createLongrVideo();
      }

      return null;
    });
    mocks.deleteObjectsFromR2.mockResolvedValue(undefined);
    mocks.downloadBlobFromR2.mockResolvedValue(new Blob(["asset"], {
      type: "application/octet-stream",
    }));
    mocks.createVideoClipFromConvexDocument.mockReturnValue({
      id: "clip_1",
      name: "Loaded clip",
    });
    mocks.createLongrVideoFromConvexDocument.mockReturnValue({
      id: "longr_1",
    });
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
    expect(mocks.useQuery).toHaveBeenCalledWith("videoClips.list", "skip");
    expect(mocks.useQuery).toHaveBeenCalledWith("stitches.list", "skip");
    expect(mocks.useQuery).toHaveBeenCalledWith("longrVideos.list", "skip");
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
    expect(mocks.downloadBlobFromR2).toHaveBeenCalledTimes(2);
    expect(mocks.createVideoClipFromConvexDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        blob: expect.any(Blob),
        posterBlob: expect.any(Blob),
      }),
    );
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

  it("generates, replaces, and removes Clipr music with owned-audio cleanup", async () => {
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
    expect(getMutation("videoClips.updateCliprMusic")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "clip_1",
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

  it("returns null when a clip has no Clipr metadata to generate against", async () => {
    const state = useClipLibraryState();

    await expect(
      state.generateCliprMusic(createClipMetadata({ cliprMetadata: undefined })),
    ).resolves.toBeNull();
    expect(mocks.generateCliprMusic).not.toHaveBeenCalled();
  });

  it("updates stitch music and text overlays, then removes stitch media", async () => {
    const state = useClipLibraryState();
    const stitch = createStitch();
    const textOverlay = {
      backgroundColor: "#000000",
      color: "#ffffff",
      fontSize: 48,
      position: { x: 50, y: 50 },
      text: "Hook",
    } as unknown as TextOverlay;

    await expect(state.generateStitchMusic(stitch)).resolves.toEqual({
      audioObject: { key: "users/user_123/music/new-stitch.mp3" },
      title: "Stitch Music",
    });
    await state.updateStitchMusic(stitch, null);
    await state.updateStitchTextOverlay(stitch, textOverlay);
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
    expect(getMutation("stitches.updateTextOverlay")).toHaveBeenCalledWith({
      id: "stitch_1",
      textOverlay,
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

  it("removes clip and longr media from R2 before deleting metadata", async () => {
    const state = useClipLibraryState();

    await state.removeClip("clip_1");
    await state.removeLongrVideo("longr_1");

    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      { key: "users/user_123/clips/clip_1/video.mp4" },
      { key: "users/user_123/clips/clip_1/poster.jpg" },
      { key: "users/user_123/music/old-clipr.mp3" },
    ]);
    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      { key: "users/user_123/longr/longr_1/video.mp4" },
      { key: "users/user_123/longr/longr_1/poster.jpg" },
    ]);
    expect(getMutation("videoClips.remove")).toHaveBeenCalledWith({
      id: "clip_1",
    });
    expect(getMutation("longrVideos.remove")).toHaveBeenCalledWith({
      id: "longr_1",
    });
  });
});
