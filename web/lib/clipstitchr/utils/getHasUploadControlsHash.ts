import { UPLOAD_CONTROLS_HASH } from "@/lib/clipstitchr/constants/uploadControlsHash";

export function getHasUploadControlsHash(hash: string) {
  return hash === UPLOAD_CONTROLS_HASH;
}
