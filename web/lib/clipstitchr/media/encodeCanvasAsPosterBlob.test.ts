import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encodeCanvasAsPosterBlob } from "@/lib/clipstitchr/media/encodeCanvasAsPosterBlob";

type MockCanvas = {
  toBlob: ReturnType<typeof vi.fn>;
};

function stubWindowTimers() {
  vi.stubGlobal("window", {
    clearTimeout: vi.fn(),
    setTimeout: vi.fn(() => 123),
  });
}

describe("encodeCanvasAsPosterBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubWindowTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("encodes a poster JPEG blob with the expected quality", async () => {
    const posterBlob = new Blob(["poster"], { type: "image/jpeg" });
    const canvas: MockCanvas = {
      toBlob: vi.fn((callback: BlobCallback) => {
        callback(posterBlob);
      }),
    };

    await expect(
      encodeCanvasAsPosterBlob(canvas as unknown as HTMLCanvasElement),
    ).resolves.toBe(posterBlob);
    expect(window.setTimeout).toHaveBeenCalledWith(expect.any(Function), 7000);
    expect(window.clearTimeout).toHaveBeenCalledWith(123);
    expect(canvas.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      "image/jpeg",
      0.86,
    );
  });

  it("rejects when canvas encoding fails", async () => {
    const canvas: MockCanvas = {
      toBlob: vi.fn((callback: BlobCallback) => {
        callback(null);
      }),
    };

    await expect(
      encodeCanvasAsPosterBlob(canvas as unknown as HTMLCanvasElement),
    ).rejects.toThrow("Unable to encode poster image.");
    expect(window.clearTimeout).toHaveBeenCalledWith(123);
  });

  it("rejects if poster encoding times out", async () => {
    const canvas: MockCanvas = {
      toBlob: vi.fn(),
    };
    vi.stubGlobal("window", {
      clearTimeout: vi.fn(),
      setTimeout: vi.fn((callback: () => void) => {
        callback();

        return 123;
      }),
    });

    await expect(
      encodeCanvasAsPosterBlob(canvas as unknown as HTMLCanvasElement),
    ).rejects.toThrow("Timed out encoding poster image.");
  });
});
