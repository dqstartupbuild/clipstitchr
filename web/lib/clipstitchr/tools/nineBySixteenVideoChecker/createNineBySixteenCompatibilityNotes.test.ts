import { describe, expect, it } from "vitest";
import { createNineBySixteenCompatibilityNotes } from "@/lib/clipstitchr/tools/nineBySixteenVideoChecker/createNineBySixteenCompatibilityNotes";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";

describe("createNineBySixteenCompatibilityNotes", () => {
  it("explains rotation and extra tracks without scoring mutable limits", () => {
    const inspection = {
      audioTrackCount: 2,
      rotation: 90,
      videoTrackCount: 2,
    } as LocalVideoInspection;

    expect(createNineBySixteenCompatibilityNotes(inspection)).toEqual([
      expect.stringContaining("90° rotation metadata"),
      expect.stringContaining("2 video tracks"),
      expect.stringContaining("2 audio tracks"),
    ]);
  });
});
