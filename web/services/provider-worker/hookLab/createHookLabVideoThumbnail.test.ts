import { describe, expect, it, vi } from "vitest";
import { createHookLabVideoThumbnail } from "./createHookLabVideoThumbnail";

describe("createHookLabVideoThumbnail", () => {
  it("removes a partial thumbnail when ffmpeg fails", async () => {
    const removeThumbnail = vi.fn().mockResolvedValue(undefined);
    const runThumbnail = vi.fn().mockRejectedValue(new Error("ffmpeg failed"));

    await expect(
      createHookLabVideoThumbnail("/tmp/source.mp4", {
        removeThumbnail,
        runThumbnail,
      }),
    ).rejects.toThrow("ffmpeg failed");
    expect(removeThumbnail).toHaveBeenCalledWith(
      expect.stringMatching(/clipstitchr-hook-lab-thumbnail-.*\.jpg$/),
    );
  });

  it("removes a thumbnail when reading the generated file fails", async () => {
    const readThumbnail = vi.fn().mockRejectedValue(new Error("read failed"));
    const removeThumbnail = vi.fn().mockResolvedValue(undefined);
    const runThumbnail = vi.fn().mockResolvedValue(undefined);

    await expect(
      createHookLabVideoThumbnail("/tmp/source.mp4", {
        readThumbnail,
        removeThumbnail,
        runThumbnail,
      }),
    ).rejects.toThrow("read failed");
    expect(removeThumbnail).toHaveBeenCalledOnce();
  });
});
