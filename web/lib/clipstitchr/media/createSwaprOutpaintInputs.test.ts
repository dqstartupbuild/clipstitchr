import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSwaprOutpaintInputs } from "@/lib/clipstitchr/media/createSwaprOutpaintInputs";

const mocks = vi.hoisted(() => ({
  createBlobFromCanvas: vi.fn(),
  loadImageFromBlob: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/media/createBlobFromCanvas", () => ({
  createBlobFromCanvas: mocks.createBlobFromCanvas,
}));

vi.mock("@/lib/clipstitchr/media/loadImageFromBlob", () => ({
  loadImageFromBlob: mocks.loadImageFromBlob,
}));

type MockContext = {
  drawImage: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
  filter: string;
  imageSmoothingEnabled: boolean;
  imageSmoothingQuality: ImageSmoothingQuality;
};

type MockCanvas = {
  getContext: ReturnType<typeof vi.fn>;
  height: number;
  width: number;
};

function createContext(): MockContext {
  return {
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: "",
    filter: "none",
    imageSmoothingEnabled: false,
    imageSmoothingQuality: "low",
  };
}

function createCanvas(context: MockContext | null): MockCanvas {
  return {
    getContext: vi.fn(() => context),
    height: 0,
    width: 0,
  };
}

describe("createSwaprOutpaintInputs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadImageFromBlob.mockResolvedValue({
      naturalHeight: 500,
      naturalWidth: 1000,
    });
    mocks.createBlobFromCanvas.mockImplementation(async (canvas: MockCanvas) =>
      new Blob([canvas.width === 1080 ? "canvas" : "fallback"], {
        type: "image/png",
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates portrait image and mask blobs with the source image centered", async () => {
    const imageContext = createContext();
    const maskContext = createContext();
    const imageCanvas = createCanvas(imageContext);
    const maskCanvas = createCanvas(maskContext);
    const createElement = vi.fn()
      .mockReturnValueOnce(imageCanvas)
      .mockReturnValueOnce(maskCanvas);

    vi.stubGlobal("document", {
      createElement,
    });

    const result = await createSwaprOutpaintInputs(
      new Blob(["source"], { type: "image/jpeg" }),
    );

    expect(createElement).toHaveBeenCalledWith("canvas");
    expect(imageCanvas.width).toBe(1080);
    expect(imageCanvas.height).toBe(1920);
    expect(maskCanvas.width).toBe(1080);
    expect(maskCanvas.height).toBe(1920);
    expect(imageContext.fillRect).toHaveBeenCalledWith(0, 0, 1080, 1920);
    expect(imageContext.drawImage).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        naturalHeight: 500,
        naturalWidth: 1000,
      }),
      -24,
      666,
      1128,
      588,
    );
    expect(imageContext.drawImage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        naturalHeight: 500,
        naturalWidth: 1000,
      }),
      0,
      690,
      1080,
      540,
    );
    expect(maskContext.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 1080, 1920);
    expect(maskContext.fillRect).toHaveBeenNthCalledWith(2, 0, 690, 1080, 540);
    expect(mocks.createBlobFromCanvas).toHaveBeenCalledWith(
      imageCanvas,
      "image/png",
    );
    expect(mocks.createBlobFromCanvas).toHaveBeenCalledWith(
      maskCanvas,
      "image/png",
    );
    expect(result).toEqual({
      imageBlob: expect.any(Blob),
      maskBlob: expect.any(Blob),
      sourceRect: {
        height: 540,
        width: 1080,
        x: 0,
        y: 690,
      },
    });
  });

  it("throws when either canvas context cannot be created", async () => {
    vi.stubGlobal("document", {
      createElement: vi.fn(() => createCanvas(null)),
    });

    await expect(
      createSwaprOutpaintInputs(new Blob(["source"])),
    ).rejects.toThrow("Unable to create Swapr outpaint image canvas.");

    const imageContext = createContext();
    vi.stubGlobal("document", {
      createElement: vi.fn()
        .mockReturnValueOnce(createCanvas(imageContext))
        .mockReturnValueOnce(createCanvas(null)),
    });

    await expect(
      createSwaprOutpaintInputs(new Blob(["source"])),
    ).rejects.toThrow("Unable to create Swapr outpaint mask canvas.");
  });
});
