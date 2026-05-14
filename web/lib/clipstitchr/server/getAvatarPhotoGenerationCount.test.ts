import { describe, expect, it } from "vitest";
import { getAvatarPhotoGenerationCount } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationCount";

describe("getAvatarPhotoGenerationCount", () => {
  it("accepts supported generation counts", () => {
    expect(getAvatarPhotoGenerationCount("1")).toBe(1);
    expect(getAvatarPhotoGenerationCount("3")).toBe(3);
    expect(getAvatarPhotoGenerationCount("5")).toBe(5);
  });

  it("falls back to three images for unsupported values", () => {
    expect(getAvatarPhotoGenerationCount("10")).toBe(3);
    expect(getAvatarPhotoGenerationCount("4")).toBe(3);
    expect(getAvatarPhotoGenerationCount("")).toBe(3);
  });
});
