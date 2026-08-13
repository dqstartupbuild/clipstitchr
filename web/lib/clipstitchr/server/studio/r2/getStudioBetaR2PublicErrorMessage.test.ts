import { describe, expect, it } from "vitest";
import { getStudioBetaR2PublicErrorMessage } from "./getStudioBetaR2PublicErrorMessage";

describe("getStudioBetaR2PublicErrorMessage", () => {
  it("preserves known validation guidance", () => {
    expect(
      getStudioBetaR2PublicErrorMessage(
        new Error("That file format is not supported here."),
        "Upload failed.",
      ),
    ).toBe("That file format is not supported here.");
  });

  it("does not expose provider URLs, object keys, or credentials", () => {
    const privateMessages = [
      "R2 failed at https://signed.example.test?token=secret",
      "users/owner_1/studio/v1/media-output/file.mp4 was rejected",
      "AWS credential abc123 was rejected",
    ];

    for (const message of privateMessages) {
      expect(
        getStudioBetaR2PublicErrorMessage(
          new Error(message),
          "Unable to create this Studio upload.",
        ),
      ).toBe("Unable to create this Studio upload.");
    }
  });
});
