import type { NormalizedRect } from "@/lib/clipstitchr/tools/tiktokSafeZone/NormalizedRect";

export type PlannedTextBox = NormalizedRect & {
  text: string;
};
