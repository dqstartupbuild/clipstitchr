import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStitchr } from "@/lib/clipstitchr/hooks/useStitchr";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => {
  const mutationFns = new Map<string, ReturnType<typeof vi.fn>>();

  return {
    createId: vi.fn(),
    generateStitchMusic: vi.fn(),
    mutationFns,
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
    stitches: {
      save: "stitches.save",
      updateMusic: "stitches.updateMusic",
    },
  },
}));

vi.mock("@/lib/clipstitchr/client/generateStitchMusic", () => ({
  generateStitchMusic: mocks.generateStitchMusic,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function getMutation(id: string) {
  const mutation = mocks.mutationFns.get(id);

  if (!mutation) {
    throw new Error(`Missing mocked mutation ${id}.`);
  }

  return mutation;
}

function createClip(id: string, name: string, duration = 12) {
  return {
    aspectRatio: 9 / 16,
    clipType: id.startsWith("demo") ? ("demo" as const) : ("ugc" as const),
    createdAt: "2026-05-20T00:00:00.000Z",
    duration,
    hasAudio: true,
    height: 1920,
    id,
    mimeType: "video/mp4",
    name,
    originalName: `${name}.mp4`,
    originalSize: 100,
    posterBlob: new Blob(["poster"], { type: "image/jpeg" }),
    size: 100,
    sourceMimeType: "video/mp4",
    tags: [id.startsWith("demo") ? "demo" : "ugc"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: `users/user_123/clips/${id}.mp4`,
      size: 100,
    },
    width: 1080,
  } as unknown as VideoClip;
}

function createTextOverlay() {
  return {
    color: "#ffffff",
    endTime: 99,
    fontSize: 200,
    startTime: -10,
    styleId: "hook" as const,
    text: " Hook ",
    width: 2,
    x: 2,
    y: -1,
  };
}

function createSharedTrack() {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "users/user_123/music/track.mp3",
      size: 20,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    id: "track_1",
    isOwnedByCurrentUser: true,
    mimeType: "audio/mpeg",
    source: "library" as const,
    size: 20,
    tags: ["upbeat"],
    title: "Upbeat",
    uploadedByOwnerId: "owner_123",
  };
}

describe("useStitchr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutationFns.clear();
    mocks.createId.mockReset();
    mocks.createId
      .mockReturnValueOnce("stitch_1")
      .mockReturnValueOnce("stitch_2")
      .mockReturnValue("stitch_next");
    mocks.generateStitchMusic.mockResolvedValue({
      audioObject: { key: "users/user_123/music/generated.mp3" },
      title: "Generated music",
    });
  });

  it("rejects empty UGC selections before saving", async () => {
    const state = useStitchr({});

    await expect(
      state.stitchVideos([], createClip("demo_1", "Demo"), {
        end: 5,
        start: 0,
      }),
    ).resolves.toEqual([]);

    expect(getMutation("stitches.save")).not.toHaveBeenCalled();
    expect(mocks.useStateSetter).toHaveBeenCalledWith("error");
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Select at least one UGC clip before stitching.",
    );
  });

  it("saves a batch of stitches with clamped trims and shared music", async () => {
    const onCreated = vi.fn();
    const state = useStitchr({ onCreated });
    const demoClip = createClip("demo_1", "Demo", 20);
    const ugcOne = createClip("ugc_1", "UGC One", 10);
    const ugcTwo = createClip("ugc_2", "UGC Two", 14);

    await expect(
      state.stitchVideos(
        [
          { clip: ugcOne, trimRange: { end: 20, start: -2 } },
          { clip: ugcTwo, trimRange: { end: 12, start: 2 } },
        ],
        demoClip,
        { end: 50, start: 4 },
        createTextOverlay(),
        {
          includeDemoAudio: false,
          includeUgcAudio: true,
          musicTrack: createSharedTrack(),
        },
      ),
    ).resolves.toHaveLength(2);

    expect(getMutation("stitches.save")).toHaveBeenCalledTimes(2);
    expect(getMutation("stitches.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        demoTrimRange: { end: 20, start: 4 },
        duration: 26,
        id: "stitch_1",
        includeDemoAudio: false,
        includeUgcAudio: true,
        textOverlay: expect.objectContaining({
          endTime: 26,
          fontSize: 0.09,
          startTime: 0,
          width: 0.92,
          x: 0.07999999999999996,
          y: 0,
        }),
        ugcTrimRange: { end: 10, start: 0 },
      }),
    );
    expect(getMutation("stitches.updateMusic")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "stitch_1",
        music: expect.objectContaining({
          sharedTrackId: "track_1",
          title: "Upbeat",
        }),
      }),
    );
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(mocks.useStateSetter).toHaveBeenCalledWith("complete");
  });

  it("saves per-selection text overlays for batch stitches", async () => {
    const state = useStitchr({});
    const demoClip = createClip("demo_1", "Demo", 10);
    const ugcOne = createClip("ugc_1", "UGC One", 8);
    const ugcTwo = createClip("ugc_2", "UGC Two", 8);

    await expect(
      state.stitchVideos(
        [
          {
            clip: ugcOne,
            textOverlay: {
              ...createTextOverlay(),
              text: "First hook",
            },
            trimRange: { end: 4, start: 0 },
          },
          {
            clip: ugcTwo,
            textOverlay: {
              ...createTextOverlay(),
              text: "Second hook",
            },
            trimRange: { end: 5, start: 1 },
          },
        ],
        demoClip,
        { end: 4, start: 0 },
      ),
    ).resolves.toHaveLength(2);

    expect(getMutation("stitches.save")).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: "stitch_1",
        textOverlay: expect.objectContaining({ text: "First hook" }),
      }),
    );
    expect(getMutation("stitches.save")).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: "stitch_2",
        textOverlay: expect.objectContaining({ text: "Second hook" }),
      }),
    );
  });

  it("generates stitch music when requested without a selected track", async () => {
    const state = useStitchr({});

    await expect(
      state.stitchVideo(
        createClip("ugc_1", "UGC"),
        createClip("demo_1", "Demo"),
        { end: 4, start: 0 },
        { end: 5, start: 1 },
        null,
        { addMusic: true },
      ),
    ).resolves.toEqual(expect.objectContaining({ id: "stitch_1" }));

    expect(mocks.generateStitchMusic).toHaveBeenCalledWith({
      stitchId: "stitch_1",
    });
    expect(getMutation("stitches.updateMusic")).toHaveBeenCalledWith({
      id: "stitch_1",
      music: expect.objectContaining({
        title: "Generated music",
      }),
    });
  });

  it("returns partial results when a later save fails", async () => {
    const state = useStitchr({});

    getMutation("stitches.save")
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("save failed"));

    await expect(
      state.stitchVideos(
        [
          {
            clip: createClip("ugc_1", "UGC One"),
            trimRange: { end: 4, start: 0 },
          },
          {
            clip: createClip("ugc_2", "UGC Two"),
            trimRange: { end: 4, start: 0 },
          },
        ],
        createClip("demo_1", "Demo"),
        { end: 4, start: 0 },
      ),
    ).resolves.toEqual([expect.objectContaining({ id: "stitch_1" })]);

    expect(mocks.useStateSetter).toHaveBeenCalledWith("error");
    expect(mocks.useStateSetter).toHaveBeenCalledWith("save failed");
  });
});
