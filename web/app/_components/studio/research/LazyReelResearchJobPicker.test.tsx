// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LazyReelResearchJobPicker } from "./LazyReelResearchJobPicker";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("LazyReelResearchJobPicker", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
  });

  it("exposes all seven tools and six planners while choosing one job", async () => {
    const onSelect = vi.fn();

    await act(async () => {
      root.render(
        <LazyReelResearchJobPicker
          disabled={false}
          onSelect={onSelect}
          selection={{ kind: "tool", key: "niche_report" }}
        />,
      );
    });

    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons).toHaveLength(13);
    expect(buttons.map((button) => button.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Niche report"),
        expect.stringContaining("Corpus status"),
        expect.stringContaining("Format deconstructor"),
        expect.stringContaining("Video editor"),
      ]),
    );
    expect(buttons[0]?.getAttribute("aria-pressed")).toBe("true");

    const videoEditor = buttons.find((button) =>
      button.textContent?.includes("Video editor"),
    );
    await act(async () => videoEditor?.click());

    expect(onSelect).toHaveBeenCalledWith({
      kind: "workflow",
      key: "video_editor",
    });
  });
});
