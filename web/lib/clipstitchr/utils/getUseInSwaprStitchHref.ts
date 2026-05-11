import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export function getUseInSwaprStitchHref(stitch: Stitch) {
  return `/dashboard/swapr?stitchId=${encodeURIComponent(stitch.id)}`;
}
