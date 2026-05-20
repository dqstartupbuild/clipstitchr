import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteTikTokFirstPartyCookies } from "@/lib/clipstitchr/analytics/deleteTikTokFirstPartyCookies";
import { tiktokPixelId } from "@/lib/clipstitchr/analytics/tiktokPixelId";

const mocks = vi.hoisted(() => ({
  deleteCookieValue: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/deleteCookieValue", () => ({
  deleteCookieValue: mocks.deleteCookieValue,
}));

describe("deleteTikTokFirstPartyCookies", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("does nothing outside the browser", () => {
    deleteTikTokFirstPartyCookies();

    expect(mocks.deleteCookieValue).not.toHaveBeenCalled();
  });

  it("deletes known and discovered TikTok cookie names", () => {
    vi.stubGlobal("document", {
      cookie: "_ttp=1; ttcsid_custom=2; unrelated=3",
    });

    deleteTikTokFirstPartyCookies();

    expect(mocks.deleteCookieValue).toHaveBeenCalledWith("_ttp");
    expect(mocks.deleteCookieValue).toHaveBeenCalledWith("_tt_enable_cookie");
    expect(mocks.deleteCookieValue).toHaveBeenCalledWith("ttclid");
    expect(mocks.deleteCookieValue).toHaveBeenCalledWith("ttcsid");
    expect(mocks.deleteCookieValue).toHaveBeenCalledWith(
      `ttcsid_${tiktokPixelId}`,
    );
    expect(mocks.deleteCookieValue).toHaveBeenCalledWith("ttcsid_custom");
  });
});
