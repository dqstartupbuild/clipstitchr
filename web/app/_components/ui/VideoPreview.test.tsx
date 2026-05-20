import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";

describe("VideoPreview", () => {
  it("renders a playable video when a source is available", () => {
    const markup = renderToStaticMarkup(
      <VideoPreview
        autoPlay
        label="UGC clip"
        muted={false}
        posterSrc="poster.jpg"
        src="video.mp4"
        trimRange={{ end: 5, start: 1 }}
      />,
    );

    expect(markup).toContain('aria-label="UGC clip"');
    expect(markup).toContain('src="video.mp4"');
    expect(markup).toContain('poster="poster.jpg"');
    expect(markup).toContain("playsInline");
  });

  it("renders poster preview buttons and loading states", () => {
    const markup = renderToStaticMarkup(
      <VideoPreview
        isLoading
        label="Demo"
        onLoadPreview={vi.fn()}
        posterSrc="poster.jpg"
        src={null}
      />,
    );

    expect(markup).toContain('aria-label="Loading preview for Demo"');
    expect(markup).toContain("background-image:url(poster.jpg)");
    expect(markup).toContain("disabled");
  });

  it("renders static poster, text preview button, and unavailable states", () => {
    const posterMarkup = renderToStaticMarkup(
      <VideoPreview label="Poster" posterSrc="poster.jpg" src={null} />,
    );
    const buttonMarkup = renderToStaticMarkup(
      <VideoPreview label="Lazy" onLoadPreview={vi.fn()} src={null} />,
    );
    const unavailableMarkup = renderToStaticMarkup(
      <VideoPreview isLoading label="Missing" src={null} />,
    );

    expect(posterMarkup).toContain('role="img"');
    expect(buttonMarkup).toContain("Preview");
    expect(unavailableMarkup).toContain("Loading preview");
  });
});
