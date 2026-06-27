import { describe, expect, it } from "vitest";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { selectAutomaticSharedMusicTrack } from "@/lib/clipstitchr/utils/selectAutomaticSharedMusicTrack";

function createTrack(
  overrides: Partial<SharedMusicTrack> = {},
): SharedMusicTrack {
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
    source: "library",
    tags: [],
    title: "Saved Sound",
    uploadedByOwnerId: "user_123",
    ...overrides,
  };
}

describe("selectAutomaticSharedMusicTrack", () => {
  it("prefers matching saved sounds", () => {
    expect(
      selectAutomaticSharedMusicTrack(
        [
          createTrack({
            id: "soft",
            title: "Soft Background",
          }),
          createTrack({
            id: "launch",
            tags: ["launch", "founders"],
            title: "Founder Launch Sound",
          }),
        ],
        "launch founders trending sound",
      )?.id,
    ).toBe("launch");
  });

  it("falls back to recent TikTok sounds when nothing matches", () => {
    expect(
      selectAutomaticSharedMusicTrack(
        [
          createTrack({
            createdAt: "2026-05-21T00:00:00.000Z",
            id: "library",
            source: "library",
          }),
          createTrack({
            createdAt: "2026-05-20T00:00:00.000Z",
            id: "tiktok",
            source: "tiktok",
          }),
        ],
        "unmatched query",
      )?.id,
    ).toBe("tiktok");
  });
});
