import { describe, expect, it } from "vitest";
import { readStudioClipsYouTubeSource } from "./readStudioClipsYouTubeSource";

describe("readStudioClipsYouTubeSource", () => {
  it("canonicalizes supported HTTPS YouTube video routes", () => {
    expect(
      readStudioClipsYouTubeSource("https://youtu.be/dQw4w9WgXcQ?t=8"),
    ).toEqual({
      canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      videoId: "dQw4w9WgXcQ",
    });

    expect(
      readStudioClipsYouTubeSource("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    ).toMatchObject({ videoId: "dQw4w9WgXcQ" });
  });

  it.each([
    "http://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.example/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&redirect=https://example.com",
    "https://user:pass@youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com:444/watch?v=dQw4w9WgXcQ",
  ])("rejects an unsafe or unsupported URL: %s", (value) => {
    expect(() => readStudioClipsYouTubeSource(value)).toThrow(
      "Paste a supported HTTPS YouTube video link.",
    );
  });
});
