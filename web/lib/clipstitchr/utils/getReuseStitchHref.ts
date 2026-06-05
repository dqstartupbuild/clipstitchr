import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export function getReuseStitchHref(stitch: Stitch) {
  return `/dashboard/stitchr?templateStitchId=${encodeURIComponent(stitch.id)}`;
}
