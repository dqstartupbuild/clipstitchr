import type { ChangeEvent } from "react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
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
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Analytics filters"
    >
      <SelectInput
        className="bg-white"
        label="What to measure"
        value={view}
        options={[
          {
            label: "Posts published in period",
            value: "published_in_period",
          },
          { label: "Growth during period", value: "growth_during_period" },
        ]}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onViewChange(
            event.currentTarget.value as
              | "published_in_period"
              | "growth_during_period",
          )
        }
      />
      <SelectInput
        className="bg-white"
        label="Time range"
        value={rangePreset}
        options={[
          { label: "Last 24 hours", value: "24_hours" },
          { label: "Last 7 days", value: "7_days" },
          { label: "Last 30 days", value: "30_days" },
          { label: "Custom range", value: "custom" },
        ]}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onRangePresetChange(
            event.currentTarget.value as SocialAnalyticsRangePreset,
          )
        }
      />
      <SelectInput
        className="bg-white"
        label="Product"
        value={productId}
        options={[
          { label: "All products", value: "" },
          ...products.map((product) => ({
            label: product.name,
            value: product.id,
          })),
        ]}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onProductChange(event.currentTarget.value)
        }
      />
      <SelectInput
        className="bg-white"
        label="Account"
        value={socialAccountId}
        options={[
          { label: "All accounts", value: "" },
          ...accounts.map((account) => ({
            label: `${account.displayName || account.username} - ${
              account.platform === "tiktok" ? "TikTok" : "Instagram"
            }`,
            value: account.id,
          })),
        ]}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onSocialAccountChange(event.currentTarget.value)
        }
      />
      {rangePreset === "custom" ? (
        <>
          <label>
            <span className="text-sm font-semibold text-text-primary">
              Start
            </span>
            <input
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none focus:border-accent"
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
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none focus:border-accent"
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
