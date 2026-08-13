import { describe, expect, it } from "vitest";
import { classifyStudioStitchPublicError } from "./classifyStudioStitchPublicError";

describe("classifyStudioStitchPublicError", () => {
  it("maps request and conflict failures without echoing internals", () => {
    expect(
      classifyStudioStitchPublicError(new Error("Recipe input is invalid.")),
    ).toEqual({
      message: "Check the Studio Stitch request and try again.",
      status: 400,
    });
    expect(
      classifyStudioStitchPublicError(new Error("Recipe revision conflict.")),
    ).toEqual({
      message: "This Studio Stitch item changed. Refresh and try again.",
      status: 409,
    });
  });

  it("does not expose a credential-bearing provider failure", () => {
    expect(
      classifyStudioStitchPublicError(
        new Error("https://provider.test?token=hidden failed"),
      ),
    ).toEqual({
      message: "Unable to complete this Studio Stitch request.",
      status: 500,
    });
  });
});
