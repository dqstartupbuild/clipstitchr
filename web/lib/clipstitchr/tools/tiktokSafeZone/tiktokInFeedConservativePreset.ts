import type { TikTokSafeZonePreset } from "@/lib/clipstitchr/tools/tiktokSafeZone/TikTokSafeZonePreset";

export const tiktokInFeedConservativePreset: TikTokSafeZonePreset = {
  lastVerified: "July 12, 2026",
  name: "TikTok In-Feed conservative LTR",
  obstructions: [
    {
      height: 0.12,
      id: "top-interface",
      label: "Top interface buffer",
      width: 1,
      x: 0,
      y: 0,
    },
    {
      height: 0.63,
      id: "right-actions",
      label: "Right action rail buffer",
      width: 0.24,
      x: 0.76,
      y: 0.14,
    },
    {
      height: 0.25,
      id: "caption-navigation",
      label: "Caption, CTA, and navigation buffer",
      width: 1,
      x: 0,
      y: 0.75,
    },
  ],
  sourceUrl:
    "https://ads.tiktok.com/help/article/tiktok-reservation-in-feed-ads-reach-frequency",
  version: "2026.07",
};
