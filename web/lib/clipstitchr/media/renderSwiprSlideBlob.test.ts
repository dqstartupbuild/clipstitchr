import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderSwiprSlideBlob } from "@/lib/clipstitchr/media/renderSwiprSlideBlob";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";

const mocks = vi.hoisted(() => ({
  createBlobFromCanvas: vi.fn(),
  drawTextOverlay: vi.fn(),
  loadImageFromBlob: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/media/createBlobFromCanvas", () => ({
  createBlobFromCanvas: mocks.createBlobFromCanvas,
}));

vi.mock("@/lib/clipstitchr/media/drawTextOverlay", () => ({
  drawTextOverlay: mocks.drawTextOverlay,
}));

vi.mock("@/lib/clipstitchr/media/loadImageFromBlob", () => ({
  loadImageFromBlob: mocks.loadImageFromBlob,
}));

function createSlide(text = "Hook"): SwiprSlide {
  return {
    id: "slide_1",
    textOverlay: {
      backgroundColor: "#000000",
      color: "#ffffff",
      endTime: 3,
      fontSize: 48,
      startTime: 0,
      styleId: "hook",
      text,
      width: 0.8,
      x: 0.5,
      y: 0.5,
    },
  };
}

describe("renderSwiprSlideBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadImageFromBlob.mockResolvedValue({
      naturalHeight: 1920,
      naturalWidth: 1080,
    });
    mocks.createBlobFromCanvas.mockResolvedValue(
      new Blob(["slide"], { type: "image/jpeg" }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("draws a cover-cropped background and optional text overlay", async () => {
    const context = {
      canvas: null as unknown,
      drawImage: vi.fn(),
    };
    const canvas = {
      getContext: vi.fn(() => context),
      height: 0,
      width: 0,
    };
    context.canvas = canvas;

    vi.stubGlobal("document", {
      createElement: vi.fn(() => canvas),
    });

    await expect(
      renderSwiprSlideBlob(
        new Blob(["background"], { type: "image/jpeg" }),
        createSlide(),
      ),
    ).resolves.toEqual(expect.any(Blob));

    expect(canvas.width).toBe(1080);
    expect(canvas.height).toBe(1920);
    expect(context.drawImage).toHaveBeenCalledWith(
      expect.objectContaining({
        naturalHeight: 1920,
        naturalWidth: 1080,
      }),
      0,
      0,
      1080,
      1920,
    );
    expect(mocks.drawTextOverlay).toHaveBeenCalledWith(
      context,
      expect.objectContaining({ text: "Hook" }),
      0,
    );
    expect(mocks.createBlobFromCanvas).toHaveBeenCalledWith(canvas, "image/png");
  });

  it("skips blank overlays and rejects missing canvas contexts", async () => {
    const context = {
      canvas: null as unknown,
      drawImage: vi.fn(),
    };
    const canvas = {
      getContext: vi.fn(() => context),
      height: 0,
      width: 0,
    };
    context.canvas = canvas;

    vi.stubGlobal("document", {
      createElement: vi.fn(() => canvas),
    });

    await renderSwiprSlideBlob(new Blob(["background"]), createSlide("   "));
    expect(mocks.drawTextOverlay).not.toHaveBeenCalled();

    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({
        getContext: vi.fn(() => null),
      })),
    });

    await expect(
      renderSwiprSlideBlob(new Blob(["background"]), createSlide()),
    ).rejects.toThrow("Unable to create Swipr slide canvas.");
  });

  it("renders an Instagram feed image at 4:5", async () => {
    const context = {
      canvas: null as unknown,
      drawImage: vi.fn(),
    };
    const canvas = {
      getContext: vi.fn(() => context),
      height: 0,
      width: 0,
    };
    context.canvas = canvas;

    vi.stubGlobal("document", {
      createElement: vi.fn(() => canvas),
    });

    await renderSwiprSlideBlob(
      new Blob(["background"], { type: "image/jpeg" }),
      createSlide(),
      { height: 1350, width: 1080 },
    );

    expect(canvas.width).toBe(1080);
    expect(canvas.height).toBe(1350);
    expect(context.drawImage).toHaveBeenCalledWith(
      expect.any(Object),
      0,
      -285,
      1080,
      1920,
    );
  });
});
