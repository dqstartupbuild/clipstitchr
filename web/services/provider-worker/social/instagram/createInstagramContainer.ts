import { getInstagramGraphApiVersion } from "@/lib/clipstitchr/social/getInstagramGraphApiVersion";
import { readSocialApiResponse } from "../readSocialApiResponse";

type InstagramContainerResponse = {
  id: string;
};

export async function createInstagramContainer(
  accountId: string,
  accessToken: string,
  values: Record<string, string>,
) {
  const body = new URLSearchParams({
    ...values,
    access_token: accessToken,
  });
  const response = await fetch(
    `https://graph.instagram.com/${getInstagramGraphApiVersion()}/${encodeURIComponent(accountId)}/media`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  return await readSocialApiResponse<InstagramContainerResponse>(
    response,
    "Instagram could not prepare this post.",
  );
}
