import { describe, expect, it } from "vitest";
import { getSocialPublishingErrorMessage } from "@/lib/clipstitchr/client/getSocialPublishingErrorMessage";

describe("getSocialPublishingErrorMessage", () => {
  it.each(["Load failed", "Failed to fetch", "Network request failed"])(
    "replaces the browser network error %s with a useful next step",
    (message) => {
      expect(
        getSocialPublishingErrorMessage(
          new TypeError(message),
          "Unable to send this post.",
        ),
      ).toBe(
        "ClipStitchr could not reach the server. Check your connection and try again.",
      );
    },
  );

  it("preserves a specific provider error", () => {
    expect(
      getSocialPublishingErrorMessage(
        new Error("Reconnect this Instagram account."),
        "Unable to send this post.",
      ),
    ).toBe("Reconnect this Instagram account.");
  });
});
