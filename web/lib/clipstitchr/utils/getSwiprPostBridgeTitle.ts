import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { createSwiprSwipeSocialDescription } from "@/lib/clipstitchr/utils/createSwiprSwipeSocialDescription";

export function getSwiprPostBridgeTitle(
  swipe: Pick<
    SwiprSwipe,
    "caption" | "description" | "hashtags" | "name" | "socialCaption"
  >,
) {
  const socialDescription = createSwiprSwipeSocialDescription(swipe);
  const title = socialDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(
      (line) =>
        line.length > 0 &&
        !line
          .split(/\s+/)
          .every((word) => word.startsWith("#") && word.length > 1),
    );

  return (title ?? swipe.name.trim()) || "Swipe";
}
