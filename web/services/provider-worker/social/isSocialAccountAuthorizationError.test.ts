import { describe, expect, it } from "vitest";
import { SocialApiError } from "./SocialApiError";
import { isSocialAccountAuthorizationError } from "./isSocialAccountAuthorizationError";

describe("isSocialAccountAuthorizationError", () => {
  it("recognizes expired or unauthorized credentials", () => {
    expect(
      isSocialAccountAuthorizationError(
        new SocialApiError(
          "Expired.",
          401,
          "{}",
          undefined,
          "access_token_invalid",
        ),
      ),
    ).toBe(true);
    expect(
      isSocialAccountAuthorizationError(
        new SocialApiError("Expired.", 400, "{}", undefined, "190"),
      ),
    ).toBe(true);
  });

  it("does not treat TikTok policy rejections as broken connections", () => {
    expect(
      isSocialAccountAuthorizationError(
        new SocialApiError(
          "Direct posting is not available.",
          403,
          "{}",
          undefined,
          "unaudited_client_can_only_post_to_private_accounts",
        ),
      ),
    ).toBe(false);
  });
});
