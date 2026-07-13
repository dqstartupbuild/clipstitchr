import type { NormalizedRect } from "@/lib/clipstitchr/tools/tiktokSafeZone/NormalizedRect";

export type SafeZoneObstruction = NormalizedRect & {
  id: string;
  label: string;
};
