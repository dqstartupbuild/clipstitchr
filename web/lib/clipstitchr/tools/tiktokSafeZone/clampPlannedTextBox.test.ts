import { describe, expect, it } from "vitest";
import { clampPlannedTextBox } from "@/lib/clipstitchr/tools/tiktokSafeZone/clampPlannedTextBox";
import { defaultPlannedTextBox } from "@/lib/clipstitchr/tools/tiktokSafeZone/defaultPlannedTextBox";

describe("clampPlannedTextBox", () => {
  it("keeps the planned text fully inside the preview", () => {
    expect(clampPlannedTextBox(defaultPlannedTextBox, 2, -1)).toMatchObject({
      x: 1 - defaultPlannedTextBox.width,
      y: 0,
    });
  });
});
