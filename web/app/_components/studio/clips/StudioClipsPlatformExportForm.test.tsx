// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioClipsPlatformExportForm } from "./StudioClipsPlatformExportForm";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("StudioClipsPlatformExportForm", () => {
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

  it("offers all supported exports and submits the chosen real render", async () => {
    const onSave = vi.fn();
    await act(async () => {
      root.render(
        <StudioClipsPlatformExportForm
          disabled={false}
          onSave={onSave}
          presets={[
            {
              id: "instagram_reels",
              label: "Instagram Reels",
              state: "available",
            },
            { id: "tiktok", label: "TikTok", state: "available" },
            {
              id: "youtube_shorts",
              label: "YouTube Shorts",
              state: "available",
            },
          ]}
        />,
      );
    });

    const select = container.querySelector<HTMLSelectElement>("select");
    expect(select?.options).toHaveLength(3);
    await act(async () => {
      if (!select) return;
      select.value = "youtube_shorts";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await act(async () => {
      container.querySelector("form")?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    expect(onSave).toHaveBeenCalledWith({
      kind: "platform_export",
      preset: "youtube_shorts",
    });
  });

  it("disables unavailable exports with a nearby explanation", async () => {
    await act(async () => {
      root.render(
        <StudioClipsPlatformExportForm
          disabled={false}
          onSave={vi.fn()}
          presets={[
            {
              id: "instagram_reels",
              label: "Instagram Reels",
              state: "unavailable",
            },
            { id: "tiktok", label: "TikTok", state: "unavailable" },
            {
              id: "youtube_shorts",
              label: "YouTube Shorts",
              state: "unavailable",
            },
          ]}
        />,
      );
    });

    expect(container.querySelector("select")?.disabled).toBe(true);
    expect(container.querySelector("button")?.disabled).toBe(true);
    expect(container.textContent).toContain(
      "Platform exports are unavailable in this environment.",
    );
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });
});
