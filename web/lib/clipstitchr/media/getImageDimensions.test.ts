import { afterEach, describe, expect, it, vi } from "vitest";
import { getImageDimensions } from "@/lib/clipstitchr/media/getImageDimensions";

class MockImage {
  naturalHeight = 240;
  naturalWidth = 320;
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

describe("getImageDimensions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads an image blob and returns natural dimensions", async () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("Image", MockImage);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:image"),
      revokeObjectURL,
    });

    await expect(getImageDimensions(new Blob(["image"]))).resolves.toEqual({
      height: 240,
      width: 320,
    });
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:image");
  });

  it("rejects unreadable images and still revokes the object URL", async () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("Image", MockImage);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:error"),
      revokeObjectURL,
    });

    await expect(getImageDimensions(new Blob(["image"]))).rejects.toThrow(
      "Unable to read this image file.",
    );
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:error");
  });
});
