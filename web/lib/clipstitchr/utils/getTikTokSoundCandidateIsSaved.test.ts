import { describe, expect, it } from "vitest";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { getTikTokSoundCandidateIsSaved } from "@/lib/clipstitchr/utils/getTikTokSoundCandidateIsSaved";

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
    source: "tiktok",
    tags: ["sound"],
    title: "Trend Sound",
    uploadedByOwnerId: "user_123",
    ...overrides,
  };
}

describe("getTikTokSoundCandidateIsSaved", () => {
  it("matches saved TikTok sounds by music id or source URL", () => {
    expect(
      getTikTokSoundCandidateIsSaved(
        {
          musicId: "music_1",
          sourceUrl: "https://www.tiktok.com/@creator/video/1",
          title: "Trend Sound",
        },
        [createTrack({ tiktokMusicId: "music_1" })],
      ),
    ).toBe(true);

    expect(
      getTikTokSoundCandidateIsSaved(
        {
          sourceUrl: "https://www.tiktok.com/@creator/video/2",
          title: "Second Sound",
        },
        [
          createTrack({
            sourceUrl: "https://www.tiktok.com/@creator/video/2",
          }),
        ],
      ),
    ).toBe(true);
  });

  it("does not match unrelated sounds", () => {
    expect(
      getTikTokSoundCandidateIsSaved(
        {
          musicId: "music_2",
          sourceUrl: "https://www.tiktok.com/@creator/video/2",
          title: "Second Sound",
        },
        [
          createTrack({
            sourceUrl: "https://www.tiktok.com/@creator/video/1",
            tiktokMusicId: "music_1",
          }),
        ],
      ),
    ).toBe(false);
  });
});
