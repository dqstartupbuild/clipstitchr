import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export function getStitchTemplateDefaultName(stitch: Stitch) {
  return `${stitch.name} template`;
}
