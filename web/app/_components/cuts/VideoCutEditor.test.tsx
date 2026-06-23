import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { VideoCutEditor } from "@/app/_components/cuts/VideoCutEditor";

describe("VideoCutEditor", () => {
  it("renders timeline controls, saved cuts, and the selected cut inspector", () => {
    const markup = renderToStaticMarkup(
      <VideoCutEditor
        duration={12}
        playheadSeconds={3}
        title="Cuts"
        trimRange={{ end: 10, start: 1 }}
        value={[{ end: 5, reason: "Loading screen", start: 2 }]}
        onChange={vi.fn()}
        onSeek={vi.fn()}
      />,
    );

    expect(markup).toContain("Timeline");
    expect(markup).toContain("Add cut");
    expect(markup).toContain("Mark start");
    expect(markup).toContain("Cut range");
    expect(markup).toContain("Cut 1");
    expect(markup).toContain("Selected cut 1");
    expect(markup).toContain("Save cuts");
  });

  it("renders an empty state without save actions when embedded", () => {
    const markup = renderToStaticMarkup(
      <VideoCutEditor
        duration={8}
        showActions={false}
        title="UGC cuts"
        trimRange={{ end: 8, start: 0 }}
        value={[]}
        onChange={vi.fn()}
      />,
    );

    expect(markup).toContain("UGC cuts");
    expect(markup).toContain("No cuts yet");
    expect(markup).toContain("No cut selected");
    expect(markup).not.toContain("Save cuts");
  });
});
