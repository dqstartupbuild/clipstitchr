import { describe, expect, it } from "vitest";
import { defaultPlannedTextBox } from "@/lib/clipstitchr/tools/tiktokSafeZone/defaultPlannedTextBox";
import { getSafeZoneAssessment } from "@/lib/clipstitchr/tools/tiktokSafeZone/getSafeZoneAssessment";
import { tiktokInFeedConservativePreset } from "@/lib/clipstitchr/tools/tiktokSafeZone/tiktokInFeedConservativePreset";

describe("getSafeZoneAssessment", () => {
  it("marks the default planned text as clear", () => {
    expect(
      getSafeZoneAssessment(
        defaultPlannedTextBox,
        tiktokInFeedConservativePreset,
      ),
    ).toEqual({ clear: true, intersectingLabels: [] });
  });

  it("names every conservative zone touched by a planned box", () => {
    const result = getSafeZoneAssessment(
      {
        height: 0.3,
        text: "Install today",
        width: 0.3,
        x: 0.72,
        y: 0.7,
      },
      tiktokInFeedConservativePreset,
    );

    expect(result.clear).toBe(false);
    expect(result.intersectingLabels).toEqual([
      "Right action rail buffer",
      "Caption, CTA, and navigation buffer",
    ]);
  });
});
