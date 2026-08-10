import type { SocialPublishingAnalyticsTimeRangeOption } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsTimeRangeOption";

export const socialPublishingAnalyticsTimeRangeOptions: SocialPublishingAnalyticsTimeRangeOption[] =
  [
    { label: "Last 24 hours", value: "last_24_hours" },
    { label: "Last 7 days", value: "last_7_days" },
    { label: "Last 30 days", value: "last_30_days" },
    { label: "Last 90 days", value: "last_90_days" },
    { label: "Last 12 months", value: "last_12_months" },
    { label: "All time", value: "all_time" },
  ];
