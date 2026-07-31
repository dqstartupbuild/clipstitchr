import { readSocialApiResponse } from "../readSocialApiResponse";

export type TikTokPublishStatus = {
  fail_reason?: string;
  publicly_available_post_id?: string[];
  publicaly_available_post_id?: string[];
  status: string;
};

export async function fetchTikTokPublishStatus(
  accessToken: string,
  publishId: string,
) {
  const response = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ publish_id: publishId }),
    },
  );
  const result = await readSocialApiResponse<{ data: TikTokPublishStatus }>(
    response,
    "TikTok post status could not be checked.",
  );

  return result.data;
}
