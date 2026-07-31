import { getInstagramGraphApiVersion } from "@/lib/clipstitchr/social/getInstagramGraphApiVersion";
import { SocialApiError } from "../SocialApiError";
import { SocialOutcomeUnknownError } from "../SocialOutcomeUnknownError";
import { readSocialApiResponse } from "../readSocialApiResponse";

type InstagramPublishResponse = {
  id: string;
};

export async function publishInstagramContainer(
  accountId: string,
  containerId: string,
  accessToken: string,
) {
  let response: Response;

  try {
    response = await fetch(
      `https://graph.instagram.com/${getInstagramGraphApiVersion()}/${encodeURIComponent(accountId)}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          access_token: accessToken,
          creation_id: containerId,
        }),
      },
    );
  } catch {
    throw new SocialOutcomeUnknownError(
      "Instagram may have published this post, but the reply was interrupted. ClipStitchr will not publish it again automatically.",
    );
  }

  try {
    return await readSocialApiResponse<InstagramPublishResponse>(
      response,
      "Instagram did not publish this post.",
    );
  } catch (error) {
    if (error instanceof SocialApiError && error.responseStatus >= 500) {
      throw new SocialOutcomeUnknownError(
        "Instagram may have published this post, but its result is unclear. ClipStitchr will not publish it again automatically.",
      );
    }
    throw error;
  }
}
