import type { SocialAnalyticsRangePreset } from "@/lib/clipstitchr/social/analytics/SocialAnalyticsRangePreset";

type SocialAnalyticsFiltersProps = {
  accounts: Array<{
    id: string;
    displayName?: string;
    username: string;
    platform: "tiktok" | "instagram";
  }>;
  customEnd: string;
  customStart: string;
  productId: string;
  products: Array<{ id: string; name: string }>;
  rangePreset: SocialAnalyticsRangePreset;
  socialAccountId: string;
  view: "published_in_period" | "growth_during_period";
  onCustomEndChange: (value: string) => void;
  onCustomStartChange: (value: string) => void;
  onProductChange: (value: string) => void;
  onRangePresetChange: (value: SocialAnalyticsRangePreset) => void;
  onSocialAccountChange: (value: string) => void;
  onViewChange: (
    value: "published_in_period" | "growth_during_period",
  ) => void;
};

export function SocialAnalyticsFilters({
  accounts,
  customEnd,
  customStart,
  productId,
  products,
  rangePreset,
  socialAccountId,
  view,
  onCustomEndChange,
  onCustomStartChange,
  onProductChange,
  onRangePresetChange,
  onSocialAccountChange,
  onViewChange,
}: SocialAnalyticsFiltersProps) {
  return (
    <section className="grid gap-4 rounded-lg bg-surface p-4 sm:grid-cols-2 xl:grid-cols-4">
      <label>
        <span className="text-sm font-semibold text-text-primary">
          What to measure
        </span>
        <select
          className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text-primary outline-none focus:border-accent"
          value={view}
          onChange={(event) =>
            onViewChange(
              event.currentTarget.value as
                | "published_in_period"
                | "growth_during_period",
            )
          }
        >
          <option value="published_in_period">Posts published in period</option>
          <option value="growth_during_period">Growth during period</option>
        </select>
      </label>
      <label>
        <span className="text-sm font-semibold text-text-primary">
          Time range
        </span>
        <select
          className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text-primary outline-none focus:border-accent"
          value={rangePreset}
          onChange={(event) =>
            onRangePresetChange(
              event.currentTarget.value as SocialAnalyticsRangePreset,
            )
          }
        >
          <option value="24_hours">Last 24 hours</option>
          <option value="7_days">Last 7 days</option>
          <option value="30_days">Last 30 days</option>
          <option value="custom">Custom range</option>
        </select>
      </label>
      <label>
        <span className="text-sm font-semibold text-text-primary">Product</span>
        <select
          className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text-primary outline-none focus:border-accent"
          value={productId}
          onChange={(event) => onProductChange(event.currentTarget.value)}
        >
          <option value="">All products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="text-sm font-semibold text-text-primary">Account</span>
        <select
          className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text-primary outline-none focus:border-accent"
          value={socialAccountId}
          onChange={(event) =>
            onSocialAccountChange(event.currentTarget.value)
          }
        >
          <option value="">All accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.displayName || account.username} (
              {account.platform === "tiktok" ? "TikTok" : "Instagram"})
            </option>
          ))}
        </select>
      </label>
      {rangePreset === "custom" ? (
        <>
          <label>
            <span className="text-sm font-semibold text-text-primary">
              Start
            </span>
            <input
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text-primary outline-none focus:border-accent"
              type="datetime-local"
              value={customStart}
              onChange={(event) =>
                onCustomStartChange(event.currentTarget.value)
              }
            />
          </label>
          <label>
            <span className="text-sm font-semibold text-text-primary">End</span>
            <input
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text-primary outline-none focus:border-accent"
              type="datetime-local"
              value={customEnd}
              onChange={(event) =>
                onCustomEndChange(event.currentTarget.value)
              }
            />
          </label>
        </>
      ) : null}
    </section>
  );
}
