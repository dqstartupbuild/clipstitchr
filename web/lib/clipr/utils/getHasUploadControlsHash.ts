import { UPLOAD_CONTROLS_HASH } from "@/lib/clipr/constants/uploadControlsHash";

export function getHasUploadControlsHash(hash: string) {
  return hash === UPLOAD_CONTROLS_HASH;
}
