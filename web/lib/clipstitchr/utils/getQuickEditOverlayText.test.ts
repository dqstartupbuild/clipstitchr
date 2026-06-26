import { describe, expect, it } from "vitest";
import { getQuickEditOverlayText } from "@/lib/clipstitchr/utils/getQuickEditOverlayText";

describe("getQuickEditOverlayText", () => {
  it("returns applied Quick Edit overlay text", () => {
    expect(
      getQuickEditOverlayText({
        quickEdit: {
          overlayText: {
            replaceWith: " Applied suggestion ",
            reason: " Current default ",
          },
        },
      }),
    ).toEqual({
      replaceWith: "Applied suggestion",
      reason: "Current default",
    });
  });

  it("ignores missing applied Quick Edit overlay text", () => {
    expect(
      getQuickEditOverlayText({
        quickEdit: null,
      }),
    ).toBeUndefined();
  });
});
