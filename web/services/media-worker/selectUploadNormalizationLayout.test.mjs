import { describe, expect, it } from "vitest";
import { selectUploadNormalizationLayout } from "./selectUploadNormalizationLayout.mjs";

describe("selectUploadNormalizationLayout", () => {
  it("keeps requested layouts", () => {
    expect(
      selectUploadNormalizationLayout({
        clipType: "ugc",
        requestedLayout: "fit-with-background",
        sourceAspectRatio: 9 / 16,
      }),
    ).toBe("fit-with-background");
  });

  it("uses fit-with-background for wide demos", () => {
    expect(
      selectUploadNormalizationLayout({
        clipType: "demo",
        requestedLayout: undefined,
        sourceAspectRatio: 16 / 9,
      }),
    ).toBe("fit-with-background");
  });

  it("keeps crop-fill for UGC and mobile-shaped videos", () => {
    expect(
      selectUploadNormalizationLayout({
        clipType: "ugc",
        requestedLayout: undefined,
        sourceAspectRatio: 16 / 9,
      }),
    ).toBe("crop-fill");
    expect(
      selectUploadNormalizationLayout({
        clipType: "demo",
        requestedLayout: undefined,
        sourceAspectRatio: 9 / 16,
      }),
    ).toBe("crop-fill");
  });
});
