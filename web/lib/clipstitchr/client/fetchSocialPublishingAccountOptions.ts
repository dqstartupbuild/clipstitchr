import { readSocialPublishingClientErrorMessage } from "@/lib/clipstitchr/client/readSocialPublishingClientErrorMessage";
import type { SocialPublishingAccountOptions } from "@/lib/clipstitchr/types/SocialPublishingAccountOptions";

export async function fetchSocialPublishingAccountOptions(productId?: string) {
  const url = new URL("/api/social-publishing/accounts", window.location.origin);

  if (productId) {
    url.searchParams.set("productId", productId);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      await readSocialPublishingClientErrorMessage(
        response,
        "Unable to load connected accounts.",
      ),
    );
  }

  return (await response.json()) as SocialPublishingAccountOptions;
}
