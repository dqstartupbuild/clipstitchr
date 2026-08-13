// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioClipsCaptionStyleControls } from "./StudioClipsCaptionStyleControls";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("StudioClipsCaptionStyleControls", () => {
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

  it("applies the selected template defaults without rejecting its font size", async () => {
    const onChange = vi.fn();

    await act(async () => {
      root.render(
        <StudioClipsCaptionStyleControls
          capabilities={{
            analysis: { message: "Not connected", state: "unavailable" },
            captionStyle: {
              builtInFonts: [{ displayName: "Bold", id: "THEBOLDFONT" }],
              customFontUpload: { message: "Not connected", state: "unavailable" },
              execution: "metadata_only",
              fontSizeOptionsPx: [18, 28, 40],
              templates: [
                { description: "Default", fontColorHex: "#FFFFFF", fontFamily: "THEBOLDFONT", fontSizePx: 32, id: "default", name: "Default" },
                { description: "Large", fontColorHex: "#FFFF00", fontFamily: "THEBOLDFONT", fontSizePx: 42, id: "mrbeast", name: "MrBeast" },
              ],
            },
            execution: { state: "unavailable", reasonCode: "worker_adapter_not_configured", message: "Not connected" },
            handoffs: {
              editor: { message: "Connected", state: "available" },
              library: { message: "Connected", state: "available" },
              stitchr: { message: "Connected", state: "available" },
            },
            limitations: [],
            outputFormats: [],
            outputMetadata: { message: "Not connected", state: "unavailable" },
            platformExports: [
              { id: "instagram_reels", label: "Instagram Reels", state: "available" },
              { id: "tiktok", label: "TikTok", state: "available" },
              { id: "youtube_shorts", label: "YouTube Shorts", state: "available" },
            ],
            productId: "product_1",
            schemaVersion: "studio-clips-capabilities-v1",
            sources: {
              upload: { state: "available", uploadEndpoint: "/api/studio/r2/upload-url" },
              youtube: { state: "available" },
            },
            sourceSnapshotVersion: "supoclip-v0_1_0",
          }}
          disabled={false}
          onChange={onChange}
          style={{
            captionTemplate: "default",
            customFont: null,
            fontColor: "#FFFFFF",
            fontFamily: "THEBOLDFONT",
            fontSizePx: 32,
          }}
        />,
      );
    });

    const template = container.querySelector("select");
    const fontSize = container.querySelector('input[type="number"]');
    expect(fontSize?.getAttribute("max")).toBe("200");

    await act(async () => {
      if (!template) return;
      template.value = "mrbeast";
      template.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        captionTemplate: "mrbeast",
        fontColor: "#FFFF00",
        fontSizePx: 42,
      }),
    );
  });
});
