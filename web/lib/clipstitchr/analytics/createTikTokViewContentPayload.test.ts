import { describe, expect, it } from "vitest";
import { createTikTokViewContentPayload } from "@/lib/clipstitchr/analytics/createTikTokViewContentPayload";

describe("createTikTokViewContentPayload", () => {
  it("creates a TikTok ViewContent payload for the homepage", () => {
    expect(createTikTokViewContentPayload("/")).toEqual({
      contents: [
        {
          brand: "ClipStitchr",
          content_category: "Marketing site",
          content_id: "home",
          content_name: "Homepage",
          content_type: "product_group",
        },
      ],
      currency: "USD",
      value: 0,
    });
  });

  it("groups dynamic docs pages without sending the exact slug", () => {
    expect(
      createTikTokViewContentPayload("/docs/getting-started"),
    ).toMatchObject({
      contents: [
        {
          content_category: "Content",
          content_id: "docs_article",
          content_name: "Docs article",
        },
      ],
    });
  });

  it("labels public app marketing tools", () => {
    expect(
      createTikTokViewContentPayload("/tools/ad-variant-calculator"),
    ).toMatchObject({
      contents: [
        {
          content_category: "Tools",
          content_id: "ad_variant_calculator",
          content_name: "Ad Variant Calculator",
        },
      ],
    });

    expect(
      createTikTokViewContentPayload("/tools/app-ugc-cost-calculator"),
    ).toMatchObject({
      contents: [
        {
          content_category: "Tools",
          content_id: "app_ugc_cost_calculator",
          content_name: "App UGC Production Cost Calculator",
        },
      ],
    });
  });
});
