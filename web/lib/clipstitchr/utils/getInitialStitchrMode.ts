import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";
import { getSearchParamValue } from "@/lib/clipstitchr/utils/getSearchParamValue";

const directEditParams = ["templateStitchId", "templateId", "ugcId", "demoId"];

export function getInitialStitchrMode(): StitchrMode {
  const requestedMode = getSearchParamValue("mode");

  if (
    requestedMode === "batch" ||
    requestedMode === "normal" ||
    requestedMode === "longr"
  ) {
    return requestedMode;
  }

  return directEditParams.some((name) => getSearchParamValue(name))
    ? "normal"
    : "batch";
}
