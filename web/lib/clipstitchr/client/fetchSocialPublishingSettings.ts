import { readSocialPublishingClientErrorMessage } from "@/lib/clipstitchr/client/readSocialPublishingClientErrorMessage";
import type { SocialPublishingSettings } from "@/lib/clipstitchr/types/SocialPublishingSettings";

export async function fetchSocialPublishingSettings() {
  const response = await fetch("/api/social-publishing/settings");

  if (!response.ok) {
    throw new Error(
      await readSocialPublishingClientErrorMessage(
        response,
        "Unable to load Zernio settings.",
      ),
    );
  }

  return ((await response.json()) as { settings: SocialPublishingSettings }).settings;
}
