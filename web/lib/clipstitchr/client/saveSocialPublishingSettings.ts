import { readSocialPublishingClientErrorMessage } from "@/lib/clipstitchr/client/readSocialPublishingClientErrorMessage";
import type { SocialPublishingSettings } from "@/lib/clipstitchr/types/SocialPublishingSettings";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

export async function saveSocialPublishingSettings(apiKey: string) {
  const response = await fetch("/api/social-publishing/settings", {
    body: JSON.stringify({ apiKey }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await readSocialPublishingClientErrorMessage(
        response,
        "Unable to save Zernio settings.",
      ),
    );
  }

  const body = (await response.json().catch(() => null)) as {
    accounts: SocialPublishingSocialAccount[];
    settings: SocialPublishingSettings;
  } | null;

  if (!body) {
    throw new Error(
      "ClipStitchr could not read the Zernio response. Refresh the page and try again.",
    );
  }

  return body;
}
