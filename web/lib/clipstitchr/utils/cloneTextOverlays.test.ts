import { describe, expect, it } from "vitest";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { cloneTextOverlays } from "@/lib/clipstitchr/utils/cloneTextOverlays";

describe("cloneTextOverlays", () => {
  it("copies each text overlay object", () => {
    const textOverlays: TextOverlay[] = [
      {
        id: "text-1",
        text: "Template hook",
        startTime: 0,
        endTime: 3,
        x: 0.16,
        y: 0.36,
        width: 0.68,
        fontSize: 0.045,
        styleId: "clean",
      },
    ];

    const result = cloneTextOverlays(textOverlays);

    expect(result).toEqual(textOverlays);
    expect(result).not.toBe(textOverlays);
    expect(result[0]).not.toBe(textOverlays[0]);
  });
});
