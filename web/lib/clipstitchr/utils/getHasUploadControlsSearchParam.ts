import {
  UPLOAD_CONTROLS_SEARCH_PARAM,
  UPLOAD_CONTROLS_SEARCH_PARAM_VALUE,
} from "@/lib/clipstitchr/constants/uploadControlsSearchParam";

export function getHasUploadControlsSearchParam(search: string) {
  return (
    new URLSearchParams(search).get(UPLOAD_CONTROLS_SEARCH_PARAM) ===
    UPLOAD_CONTROLS_SEARCH_PARAM_VALUE
  );
}
