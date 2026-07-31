"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import { SocialAnalyticsFilters } from "@/app/_components/social/SocialAnalyticsFilters";
import { SocialAnalyticsMetricGrid } from "@/app/_components/social/SocialAnalyticsMetricGrid";
import type { SocialAnalyticsRangePreset } from "@/lib/clipstitchr/social/analytics/SocialAnalyticsRangePreset";

const acceptanceMetrics: ComponentProps<
  typeof SocialAnalyticsMetricGrid
>["metrics"] = {
  views: { value: 12500, availableCount: 2, totalCount: 2 },
  likes: { value: 840, availableCount: 2, totalCount: 2 },
  comments: { value: 72, availableCount: 2, totalCount: 2 },
  shares: { value: 41, availableCount: 2, totalCount: 2 },
  saves: { value: null, availableCount: 0, totalCount: 2 },
};

export function SocialPublishingAnalyticsFixture() {
  const [view, setView] = useState<
    "published_in_period" | "growth_during_period"
  >("published_in_period");
  const [rangePreset, setRangePreset] =
    useState<SocialAnalyticsRangePreset>("7_days");
  const [productId, setProductId] = useState("");
  const [socialAccountId, setSocialAccountId] = useState("");
  const [customStart, setCustomStart] = useState("2026-07-01T09:00");
  const [customEnd, setCustomEnd] = useState("2026-07-08T09:00");

  return (
    <section
      className="rounded-lg bg-surface-elevated p-4 sm:p-6"
      aria-labelledby="browser-analytics-workflow"
    >
      <h2
        id="browser-analytics-workflow"
        className="text-xl font-bold text-text-primary"
      >
        Manual analytics
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Change the readable result view and range. Missing provider data stays
        unavailable instead of becoming zero.
      </p>
      <div className="mt-4">
        <SocialAnalyticsFilters
          accounts={[
            {
              id: "acceptance-tiktok",
              displayName: "ClipStitchr Creator",
              username: "clipstitchr_creator",
              platform: "tiktok",
            },
            {
              id: "acceptance-instagram",
              displayName: "ClipStitchr Studio",
              username: "clipstitchr_studio",
              platform: "instagram",
            },
          ]}
          customEnd={customEnd}
          customStart={customStart}
          productId={productId}
          products={[
            { id: "product-summer", name: "Summer launch" },
            { id: "product-studio", name: "Studio kit" },
          ]}
          rangePreset={rangePreset}
          socialAccountId={socialAccountId}
          view={view}
          onCustomEndChange={setCustomEnd}
          onCustomStartChange={setCustomStart}
          onProductChange={setProductId}
          onRangePresetChange={setRangePreset}
          onSocialAccountChange={setSocialAccountId}
          onViewChange={setView}
        />
      </div>
      <p className="mt-4 text-sm font-semibold text-text-primary" role="status">
        Showing{" "}
        {view === "published_in_period"
          ? "posts published in period"
          : "growth during period"}
        .
      </p>
      <div className="mt-3">
        <SocialAnalyticsMetricGrid
          metrics={acceptanceMetrics}
          showSign={view === "growth_during_period"}
        />
      </div>
    </section>
  );
}
