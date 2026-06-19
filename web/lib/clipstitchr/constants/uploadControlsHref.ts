import { UPLOAD_CONTROLS_HASH } from "@/lib/clipstitchr/constants/uploadControlsHash";
import {
  UPLOAD_CONTROLS_SEARCH_PARAM,
  UPLOAD_CONTROLS_SEARCH_PARAM_VALUE,
} from "@/lib/clipstitchr/constants/uploadControlsSearchParam";

export const UPLOAD_CONTROLS_HREF = `/dashboard/library?tab=ugc&${UPLOAD_CONTROLS_SEARCH_PARAM}=${UPLOAD_CONTROLS_SEARCH_PARAM_VALUE}${UPLOAD_CONTROLS_HASH}`;
