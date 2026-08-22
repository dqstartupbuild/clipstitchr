import { describe, expect, it } from "vitest";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import { getStitchDetailItems } from "@/lib/clipstitchr/utils/getStitchDetailItems";

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-08-22T00:00:00.000Z",
    demoClipId: "source_1",
    demoClipName: "Source video",
    duration: 5,
    height: 1920,
    id: "stitch_1",
    name: "Standalone stitch",
    ugcClipId: "source_1",
    ugcClipName: "Source video",
    width: 1080,
    ...overrides,
  };
}

describe("getStitchDetailItems", () => {
  it("shows one source block for a standalone sequence", () => {
    const items = getStitchDetailItems(
      createStitch({
        sequenceSegments: [
          {
            clipId: "source_1",
            clipName: "Source video",
            clipType: "ugc",
            duration: 5,
            order: 0,
            trimRange: { end: 5, start: 0 },
          },
        ],
      }),
    );

    expect(items).toEqual([
      { label: "Source video", value: "Source video" },
      { label: "Source trim", value: "00:00 - 00:05 (00:05)" },
      { label: "Source audio", value: "Included" },
      { label: "Source speed", value: "1x" },
    ]);
    expect(items.map((item) => item.label)).not.toContain("Demo clip");
  });

  it("keeps legacy pair labels without sequence segments", () => {
    expect(getStitchDetailItems(createStitch()).map((item) => item.label)).toEqual(
      expect.arrayContaining(["Hook/UGC clip", "Demo clip"]),
    );
  });
});
