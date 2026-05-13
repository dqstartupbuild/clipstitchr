import { describe, expect, it } from "vitest";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import { getRecentLongrVideos } from "@/lib/clipstitchr/utils/getRecentLongrVideos";

function createLongrVideo(id: string, createdAt: string): LongrVideo {
  return {
    id,
    name: id,
    clipSegments: [],
    longrObject: {
      key: `${id}.mp4`,
      contentType: "video/mp4",
      size: 100,
    },
    blob: new Blob(),
    mimeType: "video/mp4",
    size: 100,
    width: 1080,
    height: 1920,
    duration: 60,
    createdAt,
  };
}

describe("getRecentLongrVideos", () => {
  it("returns Longs by newest creation date and applies the limit", () => {
    const longrVideos = [
      createLongrVideo("old", "2026-01-01T00:00:00.000Z"),
      createLongrVideo("newest", "2026-01-04T00:00:00.000Z"),
      createLongrVideo("middle", "2026-01-03T00:00:00.000Z"),
    ];

    expect(getRecentLongrVideos(longrVideos, 2).map((video) => video.id)).toEqual(
      ["newest", "middle"],
    );
  });
});
