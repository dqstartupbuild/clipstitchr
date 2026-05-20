import { describe, expect, it } from "vitest";
import { createVideoBlobFromBuffer } from "@/lib/clipstitchr/media/createVideoBlobFromBuffer";

describe("createVideoBlobFromBuffer", () => {
  it("wraps an encoded buffer in a typed video blob", async () => {
    const blob = createVideoBlobFromBuffer(
      new Uint8Array([1, 2, 3]).buffer,
      "video/mp4",
    );

    expect(blob.type).toBe("video/mp4");
    await expect(blob.arrayBuffer()).resolves.toEqual(
      new Uint8Array([1, 2, 3]).buffer,
    );
  });

  it("throws when Media Bunny does not produce an output buffer", () => {
    expect(() => createVideoBlobFromBuffer(null, "video/mp4")).toThrow(
      "Media Bunny did not produce an output buffer.",
    );
  });
});
