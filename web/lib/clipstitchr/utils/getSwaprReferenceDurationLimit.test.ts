import { describe, expect, it } from "vitest";
import { getSwaprReferenceDurationLimit } from "@/lib/clipstitchr/utils/getSwaprReferenceDurationLimit";

describe("getSwaprReferenceDurationLimit", () => {
  it("uses 10 seconds when matching the photo orientation", () => {
    expect(getSwaprReferenceDurationLimit("image")).toBe(10);
  });

  it("uses 30 seconds when matching the video orientation", () => {
    expect(getSwaprReferenceDurationLimit("video")).toBe(30);
  });
});
