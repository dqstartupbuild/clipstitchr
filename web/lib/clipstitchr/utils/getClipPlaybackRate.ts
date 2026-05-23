import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { SourcePlaybackRateOptions } from "@/lib/clipstitchr/types/SourcePlaybackRateOptions";

export function getClipPlaybackRate(
  clipType: ClipType,
  {
    demoPlaybackRate = 1,
    ugcPlaybackRate = 1,
  }: SourcePlaybackRateOptions,
) {
  return clipType === "demo" ? demoPlaybackRate : ugcPlaybackRate;
}
