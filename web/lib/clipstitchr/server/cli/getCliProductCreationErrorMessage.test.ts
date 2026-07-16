import { describe, expect, it } from "vitest";
import { getCliProductCreationErrorMessage } from "./getCliProductCreationErrorMessage";

describe("getCliProductCreationErrorMessage", () => {
  it("uses a structured Convex message", () => {
    expect(
      getCliProductCreationErrorMessage({
        data: { message: "Archive a product before adding another." },
      }),
    ).toBe("Archive a product before adding another.");
  });

  it("falls back for an unknown failure", () => {
    expect(getCliProductCreationErrorMessage(null)).toBe(
      "Unable to save this product.",
    );
  });
});
