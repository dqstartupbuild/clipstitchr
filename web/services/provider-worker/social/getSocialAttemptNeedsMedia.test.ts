import { describe, expect, it } from "vitest";
import { getSocialAttemptNeedsMedia } from "./getSocialAttemptNeedsMedia";

describe("getSocialAttemptNeedsMedia", () => {
  it("creates media links only before a new provider initialization", () => {
    expect(getSocialAttemptNeedsMedia({ jobType: "social-publish" })).toBe(
      true,
    );
    expect(
      getSocialAttemptNeedsMedia({
        jobType: "social-publish",
        providerContainerId: "container_1",
      }),
    ).toBe(false);
    expect(
      getSocialAttemptNeedsMedia({
        jobType: "social-publish",
        providerPublishId: "publish_1",
      }),
    ).toBe(false);
    expect(
      getSocialAttemptNeedsMedia({
        jobType: "social-status-reconcile",
      }),
    ).toBe(false);
  });
});
