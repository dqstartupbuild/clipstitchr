import { describe, expect, it, vi } from "vitest";
import { createHookLabSlideshowVideo } from "./createHookLabSlideshowVideo";

describe("createHookLabSlideshowVideo", () => {
  it("builds a three-second beat for every image", async () => {
    let manifestContents = "";
    const writeManifest = vi.fn(async (filePath: string, contents: string) => {
      expect(filePath).toContain("clipstitchr-hook-lab-slideshow-");
      manifestContents = contents;
    });

    await expect(
      createHookLabSlideshowVideo(["/tmp/one.jpg", "/tmp/two.jpg"], {
        readVideo: async () => new Uint8Array([1, 2, 3]),
        removeFile: async () => undefined,
        runSlideshow: async () => undefined,
        writeManifest,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        body: new Uint8Array([1, 2, 3]),
        contentType: "video/mp4",
        durationSeconds: 6,
      }),
    );
    expect(manifestContents).toContain("duration 3");
  });

  it("rejects an empty slideshow", async () => {
    await expect(createHookLabSlideshowVideo([])).rejects.toThrow(
      "did not include any images",
    );
  });
});
