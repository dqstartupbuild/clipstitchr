import { describe, expect, it } from "vitest";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";

const baseTextOverlay: TextOverlay = {
  text: "Sale ends today",
  startTime: 1,
  endTime: 3,
  x: 0.2,
  y: 0.3,
  width: 0.6,
  fontSize: 0.045,
  styleId: "clean",
  color: "#ffffff",
};

describe("clampTextOverlay", () => {
  it("keeps text timing inside the stitched video duration", () => {
    const textOverlay = clampTextOverlay(
      {
        ...baseTextOverlay,
        startTime: -2,
        endTime: 99,
      },
      5,
    );

    expect(textOverlay.startTime).toBe(0);
    expect(textOverlay.endTime).toBe(5);
  });

  it("keeps the text box inside normalized video coordinates", () => {
    const textOverlay = clampTextOverlay(
      {
        ...baseTextOverlay,
        x: 0.95,
        y: 2,
        width: 2,
        fontSize: 1,
      },
      8,
    );

    expect(textOverlay.width).toBe(0.92);
    expect(textOverlay.x).toBeCloseTo(0.08);
    expect(textOverlay.y).toBe(0.9);
    expect(textOverlay.fontSize).toBe(0.09);
  });
});
