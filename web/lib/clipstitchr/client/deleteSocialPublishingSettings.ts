import { readSocialPublishingClientErrorMessage } from "@/lib/clipstitchr/client/readSocialPublishingClientErrorMessage";
import type { SocialPublishingSettings } from "@/lib/clipstitchr/types/SocialPublishingSettings";

export async function deleteSocialPublishingSettings() {
  const response = await fetch("/api/social-publishing/settings", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await readSocialPublishingClientErrorMessage(
        response,
        "Unable to remove Zernio settings.",
      ),
    );
  }

  return ((await response.json()) as { settings: SocialPublishingSettings }).settings;
}
