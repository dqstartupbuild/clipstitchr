import { describe, expect, it } from "vitest";
import { selectAutomaticTikTokSoundCandidate } from "@/lib/clipstitchr/utils/selectAutomaticTikTokSoundCandidate";

describe("selectAutomaticTikTokSoundCandidate", () => {
  it("prefers candidates with source and preview URLs", () => {
    expect(
      selectAutomaticTikTokSoundCandidate([
        {
          sourceUrl: "https://www.tiktok.com/@creator/video/1",
          title: "No Preview",
        },
        {
          playUrl: "https://example.com/sound.mp3",
          sourceUrl: "https://www.tiktok.com/@creator/video/2",
          title: "Preview",
        },
      ])?.title,
    ).toBe("Preview");
  });

  it("returns null when no candidate can be imported", () => {
    expect(
      selectAutomaticTikTokSoundCandidate([
        {
          title: "Missing Link",
        },
      ]),
    ).toBeNull();
  });
});
