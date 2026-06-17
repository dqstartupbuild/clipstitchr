import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { createSwiprSocialCaption } from "@/lib/clipstitchr/utils/createSwiprSocialCaption";

export function createSwiprSwipeSocialDescription(
  swipe: Pick<
    SwiprSwipe,
    "caption" | "description" | "hashtags" | "socialCaption"
  >,
) {
  const socialCaption = swipe.socialCaption?.trim();

  if (socialCaption) {
    return socialCaption;
  }

  return createSwiprSocialCaption({
    caption: swipe.caption ?? "",
    description: swipe.description ?? "",
    hashtags: swipe.hashtags ?? [],
  });
}
