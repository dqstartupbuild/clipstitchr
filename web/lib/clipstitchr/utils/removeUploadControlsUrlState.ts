import { UPLOAD_CONTROLS_SEARCH_PARAM } from "@/lib/clipstitchr/constants/uploadControlsSearchParam";
import { getHasUploadControlsHash } from "@/lib/clipstitchr/utils/getHasUploadControlsHash";
import { getHasUploadControlsSearchParam } from "@/lib/clipstitchr/utils/getHasUploadControlsSearchParam";

export function removeUploadControlsUrlState() {
  const hasUploadControlsHash = getHasUploadControlsHash(window.location.hash);
  const hasUploadControlsSearchParam = getHasUploadControlsSearchParam(
    window.location.search,
  );

  if (!hasUploadControlsHash && !hasUploadControlsSearchParam) {
    return;
  }

  const url = new URL(window.location.href);

  url.hash = "";
  url.searchParams.delete(UPLOAD_CONTROLS_SEARCH_PARAM);
  window.history.replaceState(null, "", url.toString());
}
