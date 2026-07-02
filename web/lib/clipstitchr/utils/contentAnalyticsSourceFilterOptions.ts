import type { ContentAnalyticsSourceFilter } from "@/lib/clipstitchr/types/ContentAnalyticsSourceFilter";

export const contentAnalyticsSourceFilterOptions: {
  label: string;
  value: ContentAnalyticsSourceFilter;
}[] = [
  { label: "All posts", value: "all" },
  { label: "Post Bridge", value: "post_bridge" },
  { label: "Manual posts", value: "manual" },
];
