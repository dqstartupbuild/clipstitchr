import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LongVideoPreview } from "@/app/_components/dashboard/LongVideoPreview";

describe("LongVideoPreview", () => {
  it("renders a long video with playback controls and progress", () => {
    const markup = renderToStaticMarkup(
      <LongVideoPreview
        duration={125}
        label="Longr render"
        posterSrc="poster.jpg"
        src="long.mp4"
      />,
    );

    expect(markup).toContain('aria-label="Longr render"');
    expect(markup).toContain('src="long.mp4"');
    expect(markup).toContain('poster="poster.jpg"');
    expect(markup).toContain('aria-label="Play Long"');
    expect(markup).toContain('aria-label="Replay Long"');
    expect(markup).toContain('aria-label="Long playback time"');
  });

  it("disables controls when no preview source is available", () => {
    const markup = renderToStaticMarkup(
      <LongVideoPreview duration={0} label="Missing long" src={null} />,
    );

    expect(markup).toContain("Preview unavailable");
    expect(markup).toContain("disabled");
    expect(markup).toContain("00:00 / 00:00");
  });
});
