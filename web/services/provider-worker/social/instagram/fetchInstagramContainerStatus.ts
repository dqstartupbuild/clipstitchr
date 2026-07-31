import { getInstagramGraphApiVersion } from "@/lib/clipstitchr/social/getInstagramGraphApiVersion";
import { readSocialApiResponse } from "../readSocialApiResponse";

export type InstagramContainerStatus = {
  id: string;
  status?: string;
  status_code: string;
};

export async function fetchInstagramContainerStatus(
  containerId: string,
  accessToken: string,
) {
  const url = new URL(
    `https://graph.instagram.com/${getInstagramGraphApiVersion()}/${encodeURIComponent(containerId)}`,
  );
  url.searchParams.set("fields", "id,status,status_code");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);

  return await readSocialApiResponse<InstagramContainerStatus>(
    response,
    "Instagram post preparation could not be checked.",
  );
}
