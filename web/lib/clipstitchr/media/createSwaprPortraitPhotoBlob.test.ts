import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSwaprPortraitPhotoBlob } from "@/lib/clipstitchr/media/createSwaprPortraitPhotoBlob";

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
};

type MockCanvas = {
  getContext: ReturnType<typeof vi.fn>;
  height: number;
  width: number;
};

function createCanvas(context: MockContext | null): MockCanvas {
  return {
    getContext: vi.fn(() => context),
    height: 0,
    width: 0,
  };
}

describe("createSwaprPortraitPhotoBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadImageFromBlob.mockResolvedValue({
      naturalHeight: 540,
      naturalWidth: 540,
    });
    mocks.createBlobFromCanvas.mockResolvedValue(
      new Blob(["portrait"], { type: "image/jpeg" }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("center-crops a source photo into TikTok portrait dimensions", async () => {
    const context = { drawImage: vi.fn() };
    const canvas = createCanvas(context);
    vi.stubGlobal("document", {
      createElement: vi.fn(() => canvas),
    });

    const result = await createSwaprPortraitPhotoBlob(
      new Blob(["source"], { type: "image/jpeg" }),
    );

    expect(canvas.width).toBe(1080);
    expect(canvas.height).toBe(1920);
    expect(context.drawImage).toHaveBeenCalledWith(
      expect.objectContaining({
        naturalHeight: 540,
        naturalWidth: 540,
      }),
      -420,
      0,
      1920,
      1920,
    );
    expect(mocks.createBlobFromCanvas).toHaveBeenCalledWith(
      canvas,
      "image/jpeg",
      0.92,
    );
    expect(result).toBeInstanceOf(Blob);
  });

  it("throws when the portrait canvas context cannot be created", async () => {
    vi.stubGlobal("document", {
      createElement: vi.fn(() => createCanvas(null)),
    });

    await expect(
      createSwaprPortraitPhotoBlob(new Blob(["source"])),
    ).rejects.toThrow("Unable to create Swapr portrait photo canvas.");
    expect(mocks.createBlobFromCanvas).not.toHaveBeenCalled();
  });
});
