import { adVariantInputMax } from "@/lib/clipstitchr/tools/adVariantCalculator/adVariantInputMax";

export function normalizeAdVariantCount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(adVariantInputMax, Math.max(0, Math.trunc(value)));
}
