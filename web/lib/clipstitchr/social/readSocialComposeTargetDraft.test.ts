import { describe, expect, it } from "vitest";
import { readSocialComposeTargetDraft } from "./readSocialComposeTargetDraft";

describe("readSocialComposeTargetDraft", () => {
  it("restores the saved TikTok AI disclosure", () => {
    expect(
      readSocialComposeTargetDraft({
        accountId: "account_1",
        controlsJson: JSON.stringify({ isAigc: true }),
        platform: "tiktok",
        publishMode: "direct",
      }),
    ).toMatchObject({ isAigc: true });
  });

  it("keeps legacy targets undisclosed until the user chooses otherwise", () => {
    expect(
      readSocialComposeTargetDraft({
        accountId: "account_1",
        controlsJson: "{}",
        platform: "tiktok",
        publishMode: "direct",
      }),
    ).toMatchObject({ isAigc: false });
  });
});
