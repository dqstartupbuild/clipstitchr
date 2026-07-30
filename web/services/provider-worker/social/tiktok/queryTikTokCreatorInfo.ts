import type { TikTokCreatorInfo } from "./TikTokCreatorInfo";
import { readSocialApiResponse } from "../readSocialApiResponse";

export async function queryTikTokCreatorInfo(accessToken: string) {
  const response = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: "{}",
    },
  );
  const result = await readSocialApiResponse<{
    data: TikTokCreatorInfo;
  }>(response, "TikTok creator choices could not be loaded.");

  return result.data;
}
