import type { SafeZoneObstruction } from "@/lib/clipstitchr/tools/tiktokSafeZone/SafeZoneObstruction";

export type TikTokSafeZonePreset = {
  lastVerified: string;
  name: string;
  obstructions: readonly SafeZoneObstruction[];
  sourceUrl: string;
  version: string;
};
