import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { VideoClipMusicPreview } from "@/app/_components/dashboard/VideoClipMusicPreview";

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: (blob: Blob | null) => (blob ? "blob:music" : null),
}));

describe("VideoClipMusicPreview", () => {
  it("renders video and generated music audio when both sources are available", () => {
    const markup = renderToStaticMarkup(
      <VideoClipMusicPreview
        hasSourceAudio
        label="Clipr"
        musicBlob={new Blob(["music"], { type: "audio/mpeg" })}
        musicEnabled
        musicVolume={0.5}
        posterSrc="poster.jpg"
        src="video.mp4"
        trimRange={{ end: 8, start: 2 }}
      />,
    );

    expect(markup).toContain('aria-label="Clipr"');
    expect(markup).toContain('src="video.mp4"');
    expect(markup).toContain('poster="poster.jpg"');
    expect(markup).toContain('src="blob:music"');
  });

  it("renders poster preview controls when the video source is deferred", () => {
    const markup = renderToStaticMarkup(
      <VideoClipMusicPreview
        hasSourceAudio={false}
        isLoading
        label="Saved stitch"
        musicBlob={null}
        musicEnabled={false}
        musicVolume={1}
        onLoadPreview={vi.fn()}
        posterSrc="poster.jpg"
        src={null}
      />,
    );

    expect(markup).toContain('aria-label="Preview Saved stitch"');
    expect(markup).toContain("background-image:url(poster.jpg)");
    expect(markup).toContain("disabled");
  });

  it("renders fallback preview states without poster media", () => {
    const buttonMarkup = renderToStaticMarkup(
      <VideoClipMusicPreview
        hasSourceAudio={false}
        label="Lazy"
        musicBlob={null}
        musicEnabled={false}
        musicVolume={1}
        onLoadPreview={vi.fn()}
        src={null}
      />,
    );
    const unavailableMarkup = renderToStaticMarkup(
      <VideoClipMusicPreview
        hasSourceAudio={false}
        isLoading
        label="Missing"
        musicBlob={null}
        musicEnabled={false}
        musicVolume={1}
        src={null}
      />,
    );

    expect(buttonMarkup).toContain("Preview");
    expect(unavailableMarkup).toContain("Loading preview");
  });
});
