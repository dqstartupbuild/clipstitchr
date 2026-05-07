import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipr/constants/showUploadControlsEventName";

export function dispatchShowUploadControlsEvent() {
  window.dispatchEvent(new Event(SHOW_UPLOAD_CONTROLS_EVENT_NAME));
}
