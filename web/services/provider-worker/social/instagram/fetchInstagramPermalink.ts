import { getInstagramGraphApiVersion } from "@/lib/clipstitchr/social/getInstagramGraphApiVersion";
import { readSocialApiResponse } from "../readSocialApiResponse";

export async function fetchInstagramPermalink(
  mediaId: string,
  accessToken: string,
) {
  const url = new URL(
    `https://graph.instagram.com/${getInstagramGraphApiVersion()}/${encodeURIComponent(mediaId)}`,
  );
  url.searchParams.set("fields", "permalink");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  const result = await readSocialApiResponse<{ permalink?: string }>(
    response,
    "Instagram could not load the new post link.",
  );

  return result.permalink;
}
