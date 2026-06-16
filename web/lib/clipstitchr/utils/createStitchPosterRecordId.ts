import { createId } from "@/lib/clipstitchr/utils/createId";

export function createStitchPosterRecordId(stitchId: string) {
  return `${stitchId}-${createId()}`;
}
