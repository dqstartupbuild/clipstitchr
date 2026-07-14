import { describe, expect, it } from "vitest";
import { getEmailConfirmationRequestIsSameOrigin } from "@/lib/clipstitchr/email/confirmation/getEmailConfirmationRequestIsSameOrigin";

describe("getEmailConfirmationRequestIsSameOrigin", () => {
  it("accepts exact origin or same-origin fetch metadata and rejects ambiguous requests", () => {
    const createRequest = (origin: string | null, fetchSite?: string) => {
      const headers = new Headers();
      if (origin) headers.set("origin", origin);
      if (fetchSite) headers.set("sec-fetch-site", fetchSite);
      return new Request("https://clipstitchr.com/email/confirm", { headers });
    };

    expect(
      getEmailConfirmationRequestIsSameOrigin(
        createRequest("https://clipstitchr.com", "same-origin"),
      ),
    ).toBe(true);
    expect(
      getEmailConfirmationRequestIsSameOrigin(
        createRequest(null, "same-origin"),
      ),
    ).toBe(true);
    expect(getEmailConfirmationRequestIsSameOrigin(createRequest(null))).toBe(
      false,
    );
    expect(
      getEmailConfirmationRequestIsSameOrigin(createRequest(null, "same-site")),
    ).toBe(false);
    expect(
      getEmailConfirmationRequestIsSameOrigin(
        createRequest("https://attacker.example"),
      ),
    ).toBe(false);
    expect(
      getEmailConfirmationRequestIsSameOrigin(
        createRequest("https://clipstitchr.com", "cross-site"),
      ),
    ).toBe(false);
  });
});
