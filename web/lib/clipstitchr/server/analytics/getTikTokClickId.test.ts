import { describe, expect, it } from "vitest";
import { lastTouchCookieName } from "@/lib/clipstitchr/analytics/analyticsCookieNames";
import { getTikTokClickId } from "@/lib/clipstitchr/server/analytics/getTikTokClickId";

describe("getTikTokClickId", () => {
  it("prefers ttclid from the page URL", () => {
    expect(
      getTikTokClickId({
        cookieHeader: null,
        pageUrl: "https://clipstitchr.test/?ttclid= click_1 ",
      }),
    ).toBe("click_1");
  });

  it("falls back to last-touch attribution cookies", () => {
    const attribution = encodeURIComponent(
      JSON.stringify({
        clickId: "cookie_click",
        clickIdType: "ttclid",
      }),
    );

    expect(
      getTikTokClickId({
        cookieHeader: `${lastTouchCookieName}=${attribution}`,
        pageUrl: "not-a-url",
      }),
    ).toBe("cookie_click");
    expect(
      getTikTokClickId({
        cookieHeader: `${lastTouchCookieName}=${encodeURIComponent("{}")}`,
      }),
    ).toBeUndefined();
    expect(
      getTikTokClickId({
        cookieHeader: `${lastTouchCookieName}=bad-json`,
      }),
    ).toBeUndefined();
  });
});
