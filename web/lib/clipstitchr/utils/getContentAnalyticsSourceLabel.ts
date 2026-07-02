import type { ContentAnalyticsSource } from "@/lib/clipstitchr/types/ContentAnalyticsSource";

export function getContentAnalyticsSourceLabel(source: ContentAnalyticsSource) {
  return source === "post_bridge" ? "Post Bridge" : "Manual";
}
