import { createId } from "@/lib/clipstitchr/utils/createId";

export function createStudioStitchClientId(prefix: string) {
  return `${prefix}_${createId()}`;
}
