import { describe, expect, it } from "vitest";
import { normalizeStudioClipsCaptionStyle } from "./normalizeStudioClipsCaptionStyle";

describe("normalizeStudioClipsCaptionStyle", () => {
  it("accepts only the owner's dedicated Studio font namespace", () => {
    expect(
      normalizeStudioClipsCaptionStyle(
        {
          customFontObjectKey:
            "users/user_1/studio/v1/font/product_1/font_1/custom.ttf",
          templateId: "minimal",
        },
        "user_1",
        "product_1",
      ),
    ).toMatchObject({ templateId: "minimal" });

    expect(() =>
      normalizeStudioClipsCaptionStyle(
        {
          customFontObjectKey:
            "users/user_1/studio/v1/project/project_1/custom.ttf",
          templateId: "minimal",
        },
        "user_1",
        "product_1",
      ),
    ).toThrow("another Product");
    expect(() =>
      normalizeStudioClipsCaptionStyle(
        {
          customFontObjectKey:
            "users/user_2/studio/v1/font/product_1/font_1/custom.ttf",
          templateId: "minimal",
        },
        "user_1",
        "product_1",
      ),
    ).toThrow("another Product");
    expect(() =>
      normalizeStudioClipsCaptionStyle(
        {
          customFontObjectKey:
            "users/user_1/studio/v1/font/product_2/font_1/custom.ttf",
          templateId: "minimal",
        },
        "user_1",
        "product_1",
      ),
    ).toThrow("another Product");
  });
});
