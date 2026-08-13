import { describe, expect, it } from "vitest";
import { assertStudioClipsYouTubeRedirect } from "./assertStudioClipsYouTubeRedirect";
import { readStudioClipsYouTubeUrl } from "./readStudioClipsYouTubeUrl";

describe("readStudioClipsYouTubeUrl", () => {
  it.each([
    "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=12",
    "https://music.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
  ])("accepts a fixed supported YouTube URL: %s", (url) => {
    expect(readStudioClipsYouTubeUrl(url).videoId).toBe("dQw4w9WgXcQ");
  });

  it("canonicalizes away tracking and playlist parameters", () => {
    expect(
      readStudioClipsYouTubeUrl(
        "https://youtu.be/dQw4w9WgXcQ?si=tracking-value&list=playlist",
      ).url.toString(),
    ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it.each([
    "http://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "https://youtube.com:444/watch?v=dQw4w9WgXcQ",
    "https://user:pass@youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&redirect=https://evil.test",
    "https://www.youtube.com/channel/dQw4w9WgXcQ",
  ])("rejects unsafe navigation: %s", (url) => {
    expect(() => readStudioClipsYouTubeUrl(url)).toThrow(
      "supported HTTPS YouTube",
    );
  });
});

describe("assertStudioClipsYouTubeRedirect", () => {
  it("allows a bounded redirect for the same video on another fixed host", () => {
    const redirected = assertStudioClipsYouTubeRedirect({
      fromUrl: "https://youtu.be/dQw4w9WgXcQ",
      redirectCount: 1,
      toUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    expect(redirected.hostname).toBe("www.youtube.com");
  });

  it("rejects arbitrary hosts, changed videos, and excessive redirects", () => {
    expect(() =>
      assertStudioClipsYouTubeRedirect({
        fromUrl: "https://youtu.be/dQw4w9WgXcQ",
        redirectCount: 1,
        toUrl: "https://evil.test/dQw4w9WgXcQ",
      }),
    ).toThrow();
    expect(() =>
      assertStudioClipsYouTubeRedirect({
        fromUrl: "https://youtu.be/dQw4w9WgXcQ",
        redirectCount: 1,
        toUrl: "https://youtu.be/aaaaaaaaaaa",
      }),
    ).toThrow("changed the requested video");
    expect(() =>
      assertStudioClipsYouTubeRedirect({
        fromUrl: "https://youtu.be/dQw4w9WgXcQ",
        redirectCount: 4,
        toUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      }),
    ).toThrow("limit was exceeded");
  });
});
