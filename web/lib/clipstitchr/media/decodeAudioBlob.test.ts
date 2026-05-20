import { afterEach, describe, expect, it, vi } from "vitest";
import { decodeAudioBlob } from "@/lib/clipstitchr/media/decodeAudioBlob";

describe("decodeAudioBlob", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("decodes a blob with the shared output audio parameters", async () => {
    const decoded = { duration: 1 };
    const decodeAudioData = vi.fn().mockResolvedValue(decoded);
    const OfflineAudioContextMock = vi.fn(function OfflineAudioContext() {
      return {
        decodeAudioData,
      };
    });

    vi.stubGlobal("OfflineAudioContext", OfflineAudioContextMock);

    await expect(
      decodeAudioBlob(new Blob([new Uint8Array([1, 2, 3])])),
    ).resolves.toBe(decoded);
    expect(OfflineAudioContextMock).toHaveBeenCalledWith(2, 48000, 48000);
    expect(decodeAudioData).toHaveBeenCalledWith(expect.any(ArrayBuffer));
  });
});
