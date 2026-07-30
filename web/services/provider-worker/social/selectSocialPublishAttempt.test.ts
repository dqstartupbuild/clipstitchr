import { describe, expect, it } from "vitest";
import { selectSocialPublishAttempt } from "./selectSocialPublishAttempt";

const attempts = [
  { id: "succeeded", status: "succeeded" },
  { id: "ambiguous", status: "ambiguous" },
] as never;

describe("selectSocialPublishAttempt", () => {
  it("reuses an ambiguous attempt only for reconciliation", () => {
    expect(
      selectSocialPublishAttempt(attempts, "social-status-reconcile")?.id,
    ).toBe("ambiguous");
    expect(
      selectSocialPublishAttempt(attempts, "social-publish"),
    ).toBeUndefined();
  });
});
