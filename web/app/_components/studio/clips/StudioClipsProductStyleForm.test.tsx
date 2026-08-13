// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import { StudioClipsProductStyleForm } from "./StudioClipsProductStyleForm";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({ saveStyle: vi.fn() }));

vi.mock("@/lib/clipstitchr/hooks/studioClips/useSaveStudioClipsProductStyle", () => ({
  useSaveStudioClipsProductStyle: () => ({
    error: null,
    isSaving: false,
    saveStyle: mocks.saveStyle,
    statusMessage: null,
  }),
}));

const capabilities = {
  captionStyle: {
    builtInFonts: [{ displayName: "TikTok Sans", id: "TikTokSans-Regular" }],
    customFontUpload: { message: "Available", state: "available" },
    execution: "rendered",
    fontSizeOptionsPx: [18, 28, 40],
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
  },
} as StudioClipsCapabilities;

describe("StudioClipsProductStyleForm", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveStyle.mockResolvedValue({ productId: "product_1" });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
  });

  it("saves the Product default with pointer and keyboard access", async () => {
    const onUpdated = vi.fn();
    await act(async () => {
      root.render(
        <StudioClipsProductStyleForm
          capabilities={capabilities}
          disabled={false}
          onUpdated={onUpdated}
          processingAvailable
          productId="product_1"
        />,
      );
    });

    const button = container.querySelector<HTMLButtonElement>("button");
    button?.focus();
    expect(document.activeElement).toBe(button);
    await act(async () => {
      container.querySelector("form")?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    expect(mocks.saveStyle).toHaveBeenCalledWith({
      fontColorHex: "#FFFFFF",
      fontFamily: "TikTokSans-Regular",
      fontSizePx: 28,
      templateId: "minimal",
    });
    expect(onUpdated).toHaveBeenCalledOnce();
  });

  it("keeps future style saving honest when processing is unavailable", async () => {
    await act(async () => {
      root.render(
        <StudioClipsProductStyleForm
          capabilities={capabilities}
          disabled={false}
          onUpdated={vi.fn()}
          processingAvailable={false}
          productId="product_1"
        />,
      );
    });

    expect(container.textContent).toContain("saves the default for future clips");
    expect(container.textContent).toContain("cannot be updated until processing is available");
    expect(container.querySelector<HTMLButtonElement>("button")?.disabled).toBe(false);
  });
});
