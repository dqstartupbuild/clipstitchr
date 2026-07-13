import { describe, expect, it } from "vitest";
import { filterShortFormVideoSpecs } from "@/lib/clipstitchr/tools/shortFormVideoSpecs/filterShortFormVideoSpecs";
import { shortFormVideoSpecRecords } from "@/lib/clipstitchr/tools/shortFormVideoSpecs/shortFormVideoSpecRecords";

describe("shortFormVideoSpecRecords", () => {
  it("provides substantial, dated records for every promised platform", () => {
    expect(shortFormVideoSpecRecords).toHaveLength(7);
    expect(
      new Set(shortFormVideoSpecRecords.map((record) => record.platform)),
    ).toEqual(new Set(["TikTok", "Instagram Reels", "YouTube Shorts"]));

    for (const record of shortFormVideoSpecRecords) {
      expect(record.lastVerified).toBe("2026-07-12");
      expect(record.practicalNotes.length).toBeGreaterThanOrEqual(3);
      expect(record.sourceUrl).toMatch(
        /^https:\/\/(ads\.tiktok\.com|www\.facebook\.com|support\.google\.com)\//,
      );
      expect(record.ratio).not.toHaveLength(0);
      expect(record.dimensions).not.toHaveLength(0);
      expect(record.duration).not.toHaveLength(0);
      expect(record.containers).not.toHaveLength(0);
      expect(record.codec).not.toHaveLength(0);
      expect(record.frameRate).not.toHaveLength(0);
      expect(record.audio).not.toHaveLength(0);
    }
  });

  it("filters by platform and searches practical fields", () => {
    expect(
      filterShortFormVideoSpecs(
        shortFormVideoSpecRecords,
        "YouTube Shorts",
        "1080 × 1920",
      ).map((record) => record.id),
    ).toEqual(["youtube-demand-gen-shorts"]);
    expect(
      filterShortFormVideoSpecs(
        shortFormVideoSpecRecords,
        "TikTok",
        "watermarks",
      ).map((record) => record.id),
    ).toEqual(["tiktok-reservation-push"]);
  });
});
