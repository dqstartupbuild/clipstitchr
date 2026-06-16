import { createId } from "@/lib/clipstitchr/utils/createId";

export function createVideoClipPosterRecordId(clipId: string) {
  return `${clipId}-${createId()}`;
}
