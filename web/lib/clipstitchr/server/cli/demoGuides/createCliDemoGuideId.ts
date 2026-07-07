import { createId } from "@/lib/clipstitchr/utils/createId";

export function createCliDemoGuideId() {
  return `guide_${createId().replace(/-/g, "").slice(0, 12)}`;
}
