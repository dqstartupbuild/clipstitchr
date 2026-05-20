import { afterEach, describe, expect, it, vi } from "vitest";
import { createTextOverlayRenderContext } from "@/lib/clipstitchr/media/createTextOverlayRenderContext";

describe("createTextOverlayRenderContext", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses OffscreenCanvas when available", () => {
    const context = {};
    const canvas = {
      getContext: vi.fn(() => context),
    };
    const OffscreenCanvasMock = vi.fn(function OffscreenCanvas() {
      return canvas;
    });

    vi.stubGlobal("OffscreenCanvas", OffscreenCanvasMock);

    expect(createTextOverlayRenderContext(1080, 1920)).toEqual({
      canvas,
      context,
    });
    expect(OffscreenCanvasMock).toHaveBeenCalledWith(1080, 1920);
  });

  it("falls back to document canvas and rejects missing contexts", () => {
    const context = {};
    const canvas = {
      getContext: vi.fn(() => context),
      height: 0,
      width: 0,
    };

    vi.stubGlobal("OffscreenCanvas", undefined);
    vi.stubGlobal("document", {
      createElement: vi.fn(() => canvas),
    });

    expect(createTextOverlayRenderContext(200, 400)).toEqual({
      canvas,
      context,
    });
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(400);

    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({
        getContext: vi.fn(() => null),
      })),
    });

    expect(() => createTextOverlayRenderContext(1, 1)).toThrow(
      "Unable to create a canvas renderer for text overlays.",
    );
  });

  it("throws when canvas rendering is unavailable", () => {
    vi.stubGlobal("OffscreenCanvas", undefined);
    vi.stubGlobal("document", undefined);

    expect(() => createTextOverlayRenderContext(1, 1)).toThrow(
      "Canvas rendering is unavailable in this environment.",
    );
  });
});
