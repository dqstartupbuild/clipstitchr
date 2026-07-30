import { describe, expect, it } from "vitest";
import { validateTikTokTargetControls } from "./validateTikTokTargetControls";

describe("validateTikTokTargetControls", () => {
  it("requires manual privacy selection for direct posts", () => {
    expect(() =>
      validateTikTokTargetControls(
        JSON.stringify({ consentAcknowledged: true }),
        "direct",
      ),
    ).toThrow("Choose who can watch");
  });

  it("allows inbox delivery without a privacy choice", () => {
    expect(
      validateTikTokTargetControls(
        JSON.stringify({ consentAcknowledged: true }),
        "draft",
      ),
    ).toMatchObject({ consentAcknowledged: true });
  });

  it("allows own-brand and paid-partnership disclosures together", () => {
    expect(
      validateTikTokTargetControls(
        JSON.stringify({
          consentAcknowledged: true,
          privacyLevel: "PUBLIC_TO_EVERYONE",
          brandContentToggle: true,
          brandOrganicToggle: true,
        }),
        "direct",
      ),
    ).toMatchObject({
      brandContentToggle: true,
      brandOrganicToggle: true,
    });
  });

  it("rejects paid branded content that is visible only to the creator", () => {
    expect(() =>
      validateTikTokTargetControls(
        JSON.stringify({
          consentAcknowledged: true,
          privacyLevel: "SELF_ONLY",
          brandContentToggle: true,
          brandOrganicToggle: false,
        }),
        "direct",
      ),
    ).toThrow("cannot use Only you visibility");
  });
});
