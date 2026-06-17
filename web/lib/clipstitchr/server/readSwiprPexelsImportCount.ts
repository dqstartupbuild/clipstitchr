import { SWIPR_PEXELS_IMPORT_LIMIT } from "@/lib/clipstitchr/constants/swiprPexelsImportLimit";

export function readSwiprPexelsImportCount(value: unknown) {
  const count = typeof value === "number" ? value : 24;

  return Math.max(1, Math.min(SWIPR_PEXELS_IMPORT_LIMIT, Math.round(count)));
}
