import { afterEach, describe, expect, it, vi } from "vitest";
import { loadImageFromBlob } from "@/lib/clipstitchr/media/loadImageFromBlob";

class MockImage {
  naturalHeight = 480;
  naturalWidth = 640;
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

describe("loadImageFromBlob", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads and returns an image element for a blob", async () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("Image", MockImage);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:image"),
      revokeObjectURL,
    });

    const image = await loadImageFromBlob(new Blob(["image"]));

    expect(image.naturalWidth).toBe(640);
    expect(image.naturalHeight).toBe(480);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:image");
  });

  it("rejects image load failures", async () => {
    vi.stubGlobal("Image", MockImage);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:error"),
      revokeObjectURL: vi.fn(),
    });

    await expect(loadImageFromBlob(new Blob(["image"]))).rejects.toThrow(
      "Unable to load this image.",
    );
  });
});
