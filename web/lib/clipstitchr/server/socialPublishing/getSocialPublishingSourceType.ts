import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";

export function getSocialPublishingSourceType(value: FormDataEntryValue | null) {
  if (value === "stitch" || value === "swipe") {
    return value satisfies SocialPublishingSourceType;
  }

  throw new Error("Choose a stitch or Swipe before scheduling.");
}
