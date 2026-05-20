import { afterEach, describe, expect, it, vi } from "vitest";
import { createFirstPartyAttribution } from "@/lib/clipstitchr/analytics/createFirstPartyAttribution";

describe("createFirstPartyAttribution", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null outside the browser", () => {
    expect(createFirstPartyAttribution()).toBeNull();
  });

  it("captures trimmed UTM, referrer, landing page, and click id fields", () => {
    vi.stubGlobal("window", {
      location: {
        pathname: "/dashboard/uploads",
        search:
          "?utm_source= tiktok &utm_medium= paid &utm_campaign=launch&ttclid= click_123 ",
      },
    });
    vi.stubGlobal("document", {
      referrer: " https://example.com/ad ",
    });

    expect(createFirstPartyAttribution()).toEqual(
      expect.objectContaining({
        campaign: "launch",
        clickId: "click_123",
        clickIdType: "ttclid",
        landingPage:
          "/dashboard/uploads?utm_source= tiktok &utm_medium= paid &utm_campaign=launch&ttclid= click_123",
        medium: "paid",
        referrer: "https://example.com/ad",
        source: "tiktok",
      }),
    );
  });

  it("omits blank values from sparse landing state", () => {
    vi.stubGlobal("window", {
      location: {
        pathname: "",
        search: "?utm_source=+",
      },
    });
    vi.stubGlobal("document", {
      referrer: "",
    });

    expect(createFirstPartyAttribution()).toEqual(
      expect.objectContaining({
        landingPage: "?utm_source=+",
        referrer: undefined,
        source: undefined,
      }),
    );
  });
});
