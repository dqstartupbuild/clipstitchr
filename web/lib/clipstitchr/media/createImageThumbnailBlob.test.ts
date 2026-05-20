import { afterEach, describe, expect, it, vi } from "vitest";
import { createImageThumbnailBlob } from "@/lib/clipstitchr/media/createImageThumbnailBlob";

class MockImage {
  naturalHeight = 800;
  naturalWidth = 1200;
  onerror: (() => void) | null = null;
  onload: (() => void) | null = null;

  set src(value: string) {
    if (value === "blob:error") {
      this.onerror?.();
      return;
    }

    this.onload?.();
  }
}

type MockCanvas = {
  getContext: ReturnType<typeof vi.fn>;
  height: number;
  toBlob: ReturnType<typeof vi.fn>;
  width: number;
};

function createCanvas(context: object | null, blob: Blob | null): MockCanvas {
  return {
    getContext: vi.fn(() => context),
    height: 0,
    toBlob: vi.fn((callback: BlobCallback) => callback(blob)),
    width: 0,
  };
}

describe("createImageThumbnailBlob", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("scales a large image into a JPEG thumbnail", async () => {
    const context = { drawImage: vi.fn() };
    const thumbnailBlob = new Blob(["thumbnail"], { type: "image/jpeg" });
    const canvas = createCanvas(context, thumbnailBlob);
    const revokeObjectURL = vi.fn();

    vi.stubGlobal("Image", MockImage);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:image"),
      revokeObjectURL,
    });
    vi.stubGlobal("document", {
      createElement: vi.fn(() => canvas),
    });

    await expect(createImageThumbnailBlob(new Blob(["image"]))).resolves.toBe(
      thumbnailBlob,
    );
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(427);
    expect(context.drawImage).toHaveBeenCalledWith(
      expect.any(MockImage),
      0,
      0,
      640,
      427,
    );
    expect(canvas.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      "image/jpeg",
      0.82,
    );
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:image");
  });

  it("rejects image, canvas, and encoding failures", async () => {
    vi.stubGlobal("Image", MockImage);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:error"),
      revokeObjectURL: vi.fn(),
    });

    await expect(createImageThumbnailBlob(new Blob(["image"]))).rejects.toThrow(
      "Unable to load image thumbnail.",
    );

    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:image"),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal("document", {
      createElement: vi.fn(() => createCanvas(null, new Blob(["thumbnail"]))),
    });

    await expect(createImageThumbnailBlob(new Blob(["image"]))).rejects.toThrow(
      "Unable to create thumbnail canvas.",
    );

    vi.stubGlobal("document", {
      createElement: vi.fn(() => createCanvas({ drawImage: vi.fn() }, null)),
    });

    await expect(createImageThumbnailBlob(new Blob(["image"]))).rejects.toThrow(
      "Unable to encode image thumbnail.",
    );
  });
});
