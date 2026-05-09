import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/showUploadControlsEventName";
import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";

export function dispatchShowUploadControlsEvent(assetType?: UploadAssetType) {
  window.dispatchEvent(
    new CustomEvent(SHOW_UPLOAD_CONTROLS_EVENT_NAME, {
      detail: assetType ? { assetType } : {},
    }),
  );
}
