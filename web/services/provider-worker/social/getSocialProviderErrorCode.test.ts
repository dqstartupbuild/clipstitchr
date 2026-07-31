import { describe, expect, it } from "vitest";
import { getSocialProviderErrorCode } from "./getSocialProviderErrorCode";

describe("getSocialProviderErrorCode", () => {
  it("reads TikTok string error codes", () => {
    expect(
      getSocialProviderErrorCode(
        JSON.stringify({
          error: {
            code: "unaudited_client_can_only_post_to_private_accounts",
          },
        }),
      ),
    ).toBe("unaudited_client_can_only_post_to_private_accounts");
  });

  it("normalizes Meta numeric error codes", () => {
    expect(
      getSocialProviderErrorCode(
        JSON.stringify({
          error: {
            code: 190,
          },
        }),
      ),
    ).toBe("190");
  });

  it("ignores bodies without a provider code", () => {
    expect(getSocialProviderErrorCode("not-json")).toBeUndefined();
    expect(getSocialProviderErrorCode("{}")).toBeUndefined();
  });
});
