import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SocialAnalyticsFilters } from "./SocialAnalyticsFilters";

describe("SocialAnalyticsFilters", () => {
  it("uses the shared application select treatment for every filter", () => {
    const markup = renderToStaticMarkup(
      <SocialAnalyticsFilters
        accounts={[
          {
            id: "account-1",
            username: "creator",
            platform: "tiktok",
          },
        ]}
        customEnd="2026-07-08T09:00"
        customStart="2026-07-01T09:00"
        productId=""
        products={[{ id: "product-1", name: "Product one" }]}
        rangePreset="7_days"
        socialAccountId=""
        view="published_in_period"
        onCustomEndChange={vi.fn()}
        onCustomStartChange={vi.fn()}
        onProductChange={vi.fn()}
        onRangePresetChange={vi.fn()}
        onSocialAccountChange={vi.fn()}
        onViewChange={vi.fn()}
      />,
    );

    expect(markup.match(/ui-select-input/g)).toHaveLength(4);
    expect(markup).toContain("All products");
    expect(markup).toContain("creator - TikTok");
  });
});
