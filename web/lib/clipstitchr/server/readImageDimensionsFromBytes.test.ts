import { describe, expect, it } from "vitest";
import { readImageDimensionsFromBytes } from "@/lib/clipstitchr/server/readImageDimensionsFromBytes";

describe("readImageDimensionsFromBytes", () => {
  it("reads PNG dimensions", () => {
    const bytes = new Uint8Array(24);

    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    bytes.set([0x00, 0x00, 0x04, 0x38], 16);
    bytes.set([0x00, 0x00, 0x07, 0x80], 20);

    expect(readImageDimensionsFromBytes(bytes.buffer, "image/png")).toEqual({
      width: 1080,
      height: 1920,
    });
  });

  it("reads JPEG dimensions", () => {
    const bytes = new Uint8Array([
      0xff,
      0xd8,
      0xff,
      0xc0,
      0x00,
      0x11,
      0x08,
      0x07,
      0x80,
      0x04,
      0x38,
      0x03,
      0x01,
      0x11,
      0x00,
      0x02,
      0x11,
      0x00,
      0x03,
      0x11,
      0x00,
      0xff,
      0xd9,
    ]);

    expect(readImageDimensionsFromBytes(bytes.buffer, "image/jpeg")).toEqual({
      width: 1080,
      height: 1920,
    });
  });
});
