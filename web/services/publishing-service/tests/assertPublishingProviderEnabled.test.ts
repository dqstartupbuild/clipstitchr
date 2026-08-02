import { describe, expect, it } from "vitest";

import { PublishingProviderDisabledError } from "../src/errors/PublishingProviderDisabledError.js";
import { assertPublishingProviderEnabled } from "../src/providers/assertPublishingProviderEnabled.js";

describe("assertPublishingProviderEnabled", () => {
  it("accepts only providers in the explicit allowlist", () => {
    expect(() =>
      assertPublishingProviderEnabled(["instagram", "tiktok"], "instagram"),
    ).not.toThrow();
    expect(() =>
      assertPublishingProviderEnabled(["instagram", "tiktok"], "tiktok"),
    ).not.toThrow();
  });

  it("rejects a supported provider that is disabled", () => {
    expect(() =>
      assertPublishingProviderEnabled(
        ["instagram", "tiktok"],
        "instagram-standalone",
      ),
    ).toThrow(new PublishingProviderDisabledError());
  });

  it("fails closed for an unknown runtime provider value", () => {
    expect(() =>
      assertPublishingProviderEnabled(
        ["instagram", "tiktok"],
        "youtube" as "tiktok",
      ),
    ).toThrow(new PublishingProviderDisabledError());
  });
});
