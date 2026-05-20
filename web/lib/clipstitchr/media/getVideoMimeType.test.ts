import { describe, expect, it, vi } from "vitest";
import type { Output } from "mediabunny";
import { getVideoMimeType } from "@/lib/clipstitchr/media/getVideoMimeType";

describe("getVideoMimeType", () => {
  it("returns the output mime type when Media Bunny can provide one", async () => {
    const output = {
      getMimeType: vi.fn().mockResolvedValue("video/webm"),
    } as unknown as Output;

    await expect(getVideoMimeType(output)).resolves.toBe("video/webm");
  });

  it("falls back to mp4 when Media Bunny cannot provide a mime type", async () => {
    const output = {
      getMimeType: vi.fn().mockRejectedValue(new Error("not finalized")),
    } as unknown as Output;

    await expect(getVideoMimeType(output)).resolves.toBe("video/mp4");
  });
});
