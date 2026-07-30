import { describe, expect, it } from "vitest";
import { redactProviderJobErrorMessage } from "./redactProviderJobErrorMessage";

describe("redactProviderJobErrorMessage", () => {
  it("removes credentials from social job errors", () => {
    const result = redactProviderJobErrorMessage(
      "social-publish",
      "fetch failed for https://graph.example.com/media?access_token=secret",
    );

    expect(result).not.toContain("secret");
    expect(result).toContain("[REDACTED]");
  });

  it("does not alter unrelated provider job errors", () => {
    expect(
      redactProviderJobErrorMessage("manual-clipr", "ordinary failure"),
    ).toBe("ordinary failure");
  });
});
