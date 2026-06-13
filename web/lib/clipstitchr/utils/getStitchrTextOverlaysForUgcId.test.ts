import { describe, expect, it } from "vitest";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getStitchrTextOverlaysForUgcId } from "@/lib/clipstitchr/utils/getStitchrTextOverlaysForUgcId";

const createTextOverlay = (id: string, text: string): TextOverlay => ({
  id,
  text,
  startTime: 0,
  endTime: 3,
  x: 0.16,
  y: 0.36,
  width: 0.68,
  fontSize: 0.045,
  styleId: "clean",
});

describe("getStitchrTextOverlaysForUgcId", () => {
  it("returns UGC-specific text overlays when they exist", () => {
    const fallbackTextOverlays = [createTextOverlay("fallback", "Template")];
    const ugcTextOverlays = [createTextOverlay("ugc", "Custom")];

    expect(
      getStitchrTextOverlaysForUgcId({
        fallbackTextOverlays,
        textOverlaysByUgcId: {
          "ugc-1": ugcTextOverlays,
        },
        ugcId: "ugc-1",
      }),
    ).toBe(ugcTextOverlays);
  });

  it("returns fallback text overlays when a selected UGC has no override", () => {
    const fallbackTextOverlays = [createTextOverlay("fallback", "Template")];

    expect(
      getStitchrTextOverlaysForUgcId({
        fallbackTextOverlays,
        textOverlaysByUgcId: {},
        ugcId: "ugc-2",
      }),
    ).toBe(fallbackTextOverlays);
  });

  it("keeps an explicit empty UGC override instead of falling back", () => {
    const fallbackTextOverlays = [createTextOverlay("fallback", "Template")];
    const ugcTextOverlays: TextOverlay[] = [];

    expect(
      getStitchrTextOverlaysForUgcId({
        fallbackTextOverlays,
        textOverlaysByUgcId: {
          "ugc-1": ugcTextOverlays,
        },
        ugcId: "ugc-1",
      }),
    ).toBe(ugcTextOverlays);
  });

  it("returns an empty list without a fallback or UGC override", () => {
    expect(
      getStitchrTextOverlaysForUgcId({
        fallbackTextOverlays: null,
        textOverlaysByUgcId: {},
        ugcId: "ugc-3",
      }),
    ).toEqual([]);
  });
});
