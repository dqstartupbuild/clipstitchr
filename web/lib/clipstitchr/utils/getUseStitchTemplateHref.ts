import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";

export function getUseStitchTemplateHref(template: StitchTemplate) {
  return `/dashboard/stitchr?templateId=${encodeURIComponent(template.id)}`;
}
