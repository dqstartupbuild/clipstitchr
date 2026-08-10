import { socialPublishingSupportedPlatforms } from "@/lib/clipstitchr/server/socialPublishing/socialPublishingSupportedPlatforms";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export function isSocialPublishingPlatform(value: unknown): value is SocialPublishingPlatform {
  return (
    typeof value === "string" &&
    socialPublishingSupportedPlatforms.includes(value as SocialPublishingPlatform)
  );
}
