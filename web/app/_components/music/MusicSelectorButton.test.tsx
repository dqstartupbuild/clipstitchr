import { beforeEach, describe, expect, it, vi } from "vitest";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

const mocks = vi.hoisted(() => ({
  getAudioBlobDuration: vi.fn(),
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  tracks: [] as SharedMusicTrack[],
  uploadedTrack: null as SharedMusicTrack | null,
  acceptRights: vi.fn(),
  importTikTokSound: vi.fn(),
  searchTikTokSounds: vi.fn(),
  uploadSharedMusicTrack: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
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

vi.mock("@/lib/clipstitchr/hooks/useSharedMusicTracks", () => ({
  useSharedMusicTracks: () => ({
    isLoading: false,
    tracks: mocks.tracks,
  }),
}));

vi.mock("@/lib/clipstitchr/client/getAudioBlobDuration", () => ({
  getAudioBlobDuration: mocks.getAudioBlobDuration,
}));

vi.mock("@/lib/clipstitchr/client/uploadSharedMusicTrack", () => ({
  uploadSharedMusicTrack: mocks.uploadSharedMusicTrack,
}));

vi.mock("@/lib/clipstitchr/client/importTikTokSound", () => ({
  importTikTokSound: mocks.importTikTokSound,
}));

vi.mock("@/lib/clipstitchr/client/searchTikTokSounds", () => ({
  searchTikTokSounds: mocks.searchTikTokSounds,
}));

vi.mock("@/lib/clipstitchr/hooks/useSoundPreferences", () => ({
  useSoundPreferences: () => ({
    acceptRights: mocks.acceptRights,
    hasAcceptedRights: true,
    isLoading: false,
  }),
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

function createTrack(overrides: Partial<SharedMusicTrack> = {}): SharedMusicTrack {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "users/user_123/music/track.mp3",
      size: 1234,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 32,
    id: "track_1",
    isOwnedByCurrentUser: true,
    mimeType: "audio/mpeg",
    size: 1234,
    source: "stitchr",
    tags: ["electronic"],
    title: "Bright Hook",
    uploadedByOwnerId: "user_123",
    ...overrides,
  };
}

describe("MusicSelectorButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.uploadedTrack = createTrack({ id: "uploaded_track" });
    mocks.acceptRights.mockResolvedValue(undefined);
    mocks.importTikTokSound.mockResolvedValue(mocks.uploadedTrack);
    mocks.searchTikTokSounds.mockResolvedValue([
      {
        sourceUrl: "https://www.tiktok.com/@creator/video/1",
        title: "Trend Sound",
      },
    ]);
    mocks.getAudioBlobDuration.mockResolvedValue(32);
    mocks.uploadSharedMusicTrack.mockResolvedValue(mocks.uploadedTrack);
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    mocks.tracks = [createTrack()];
  });

  it("opens the selector dialog from the button", () => {
    mocks.stateQueue = [false, [], false, false, false, false, null];

    const tree = MusicSelectorButton({
      onSelectTrack: vi.fn(),
      source: "stitchr",
    });
    const [button] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "Button",
    );

    (button.props.onClick as () => void)();

    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(true);
  });

  it("selects existing and uploaded tracks from the dialog", async () => {
    const onSelectTrack = vi.fn();
    const uploadFile = new File(["audio"], "hook.mp3", { type: "audio/mpeg" });

    mocks.stateQueue = [true, [], false, false, false, false, null];

    const tree = MusicSelectorButton({
      onSelectTrack,
      selectedTrackId: "track_1",
      source: "stitchr",
    });
    const [dialog] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "MusicSelectorDialog",
    );

    await (dialog.props.onSelect as (track: SharedMusicTrack) => Promise<void>)(
      mocks.tracks[0],
    );
    await (dialog.props.onUpload as (file: File, title: string) => Promise<void>)(
      uploadFile,
      "Uploaded Hook",
    );

    expect(onSelectTrack).toHaveBeenCalledWith(mocks.tracks[0]);
    expect(mocks.getAudioBlobDuration).toHaveBeenCalledWith(uploadFile);
    expect(mocks.uploadSharedMusicTrack).toHaveBeenCalledWith({
      durationSeconds: 32,
      file: uploadFile,
      source: "stitchr",
      title: "Uploaded Hook",
    });
    expect(onSelectTrack).toHaveBeenCalledWith(mocks.uploadedTrack);
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(false);
    expect(mocks.setStateCalls[5]).toHaveBeenCalledWith(true);
    expect(mocks.setStateCalls[5]).toHaveBeenCalledWith(false);
  });

  it("searches and imports TikTok sounds from the dialog", async () => {
    const onSelectTrack = vi.fn();

    mocks.stateQueue = [true, [], false, false, false, false, null];

    const tree = MusicSelectorButton({
      onSelectTrack,
      selectedTrackId: "track_1",
      source: "stitchr",
    });
    const [dialog] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "MusicSelectorDialog",
    );

    await (
      dialog.props.onSearchTikTokSounds as (query: string) => Promise<void>
    )("skin care");
    await (
      dialog.props.onImportTikTokSound as (sourceUrl: string) => Promise<void>
    )("https://www.tiktok.com/@creator/video/1");

    expect(mocks.searchTikTokSounds).toHaveBeenCalledWith("skin care");
    expect(mocks.importTikTokSound).toHaveBeenCalledWith(
      "https://www.tiktok.com/@creator/video/1",
    );
    expect(onSelectTrack).toHaveBeenCalledWith(mocks.uploadedTrack);
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith([]);
    expect(mocks.setStateCalls[3]).toHaveBeenCalledWith(true);
    expect(mocks.setStateCalls[3]).toHaveBeenCalledWith(false);
    expect(mocks.setStateCalls[4]).toHaveBeenCalledWith(true);
    expect(mocks.setStateCalls[4]).toHaveBeenCalledWith(false);
  });

  it("keeps the dialog open and shows errors when selection fails", async () => {
    const onSelectTrack = vi.fn(async () => {
      throw new Error("Unable to save track.");
    });

    mocks.stateQueue = [true, [], false, false, false, false, null];

    const tree = MusicSelectorButton({
      onSelectTrack,
      source: "clipr",
    });
    const [dialog] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "MusicSelectorDialog",
    );

    await (dialog.props.onSelect as (track: SharedMusicTrack) => Promise<void>)(
      mocks.tracks[0],
    );

    expect(mocks.setStateCalls[6]).toHaveBeenCalledWith("Unable to save track.");
    expect(mocks.setStateCalls[0]).not.toHaveBeenCalledWith(false);
  });
});
