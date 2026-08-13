import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";

export function getLazyReelBreakoutChecklist() {
  return (getLazyReelCorpusSnapshot().breakoutModel.laws ?? []).map((item) => item.law);
}
