import { describe, expect, it } from "vitest";
import { validateSafeZoneImage } from "@/lib/clipstitchr/tools/tiktokSafeZone/validateSafeZoneImage";

describe("validateSafeZoneImage", () => {
  it("accepts a bounded local image", () => {
    expect(
      validateSafeZoneImage({ size: 5_000, type: "image/png" } as File),
    ).toBeNull();
  });

  it("rejects unsupported types and oversized images", () => {
    expect(
      validateSafeZoneImage({ size: 5_000, type: "image/gif" } as File),
    ).toBe("Choose a JPG, PNG, or WebP image.");
    expect(
      validateSafeZoneImage({
        size: 20 * 1024 * 1024 + 1,
        type: "image/jpeg",
      } as File),
    ).toBe("Choose an image smaller than 20 MB.");
  });
});
