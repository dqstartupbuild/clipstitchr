// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/types/studioClips/StudioClipsCapabilities";
import { StudioClipsCaptionsForm } from "./StudioClipsCaptionsForm";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const captionStyle = {
  builtInFonts: [{ displayName: "TikTok Sans", id: "TikTokSans-Regular" }],
  customFontUpload: { message: "Available", state: "available" },
  execution: "rendered",
  fontSizeOptionsPx: [28, 40],
  templates: [
    {
      description: "Clean captions",
      fontColorHex: "#FFFFFF",
      fontFamily: "TikTokSans-Regular",
      fontSizePx: 28,
      id: "minimal",
      name: "Minimal",
    },
  ],
} satisfies StudioClipsCapabilities["captionStyle"];

describe("StudioClipsCaptionsForm", () => {
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

  it("submits the renderer-supported caption style instead of inert copy", async () => {
    const onSave = vi.fn();
    await act(async () => {
      root.render(
        <StudioClipsCaptionsForm
          captionStyle={captionStyle}
          disabled={false}
          onSave={onSave}
        />,
      );
    });

    expect(container.querySelector("textarea")).toBeNull();
    await act(async () => container.querySelector("button")?.click());

    expect(onSave).toHaveBeenCalledWith({
      burnIn: true,
      enabled: true,
      kind: "captions",
      style: {
        fontColorHex: "#FFFFFF",
        fontFamily: "TikTokSans-Regular",
        fontSizePx: 28,
        templateId: "minimal",
      },
    });
    expect(container.textContent).toContain("need saved word timing");
  });
});
