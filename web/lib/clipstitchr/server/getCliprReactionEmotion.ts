import { cliprReactionEmotionOptions } from "@/lib/clipstitchr/constants/cliprReactionEmotionOptions";
import { getSeededIndex } from "@/lib/clipstitchr/utils/getSeededIndex";

export function getCliprReactionEmotion(seed: string) {
  return cliprReactionEmotionOptions[
    getSeededIndex(seed, cliprReactionEmotionOptions.length)
  ];
}
