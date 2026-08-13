import { describe, expect, it } from "vitest";
import { getStudioLazyReelPublicErrorMessage } from "./getStudioLazyReelPublicErrorMessage";

describe("getStudioLazyReelPublicErrorMessage", () => {
  it("preserves bounded request guidance", () => {
    expect(
      getStudioLazyReelPublicErrorMessage(
        new Error("Result limit must be a whole number from 1 to 20."),
      ),
    ).toBe("Result limit must be a whole number from 1 to 20.");
  });

  it("does not expose filesystem, URL, or credential-bearing failures", () => {
    for (const message of [
      "ENOENT /private/vendor/corpus.json",
      "Fetch failed at https://example.test?token=hidden",
      "Authorization bearer hidden",
    ]) {
      expect(getStudioLazyReelPublicErrorMessage(new Error(message))).toBe(
        "Unable to complete this research job.",
      );
    }
  });
});
