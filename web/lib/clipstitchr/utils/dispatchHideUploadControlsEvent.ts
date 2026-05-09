import { HIDE_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/hideUploadControlsEventName";
import { removeUploadControlsUrlState } from "@/lib/clipstitchr/utils/removeUploadControlsUrlState";

export function dispatchHideUploadControlsEvent() {
  removeUploadControlsUrlState();
  window.dispatchEvent(new Event(HIDE_UPLOAD_CONTROLS_EVENT_NAME));
}
