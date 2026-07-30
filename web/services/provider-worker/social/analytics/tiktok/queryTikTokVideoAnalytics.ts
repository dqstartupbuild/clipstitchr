import { readSocialApiResponse } from "../../readSocialApiResponse";
import { readNullableSocialMetricCount } from "../readNullableSocialMetricCount";

export type TikTokVideoAnalytics = {
  id: string;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  shareCount: number | null;
};

export async function queryTikTokVideoAnalytics(
  accessToken: string,
  videoIds: string[],
) {
  if (videoIds.length < 1 || videoIds.length > 20) {
    throw new Error("TikTok analytics batches must contain 1 to 20 videos.");
  }

  const url = new URL("https://open.tiktokapis.com/v2/video/query/");
  url.searchParams.set(
    "fields",
    "id,view_count,like_count,comment_count,share_count",
  );
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filters: { video_ids: videoIds } }),
  });
  const result = await readSocialApiResponse<{
    data?: {
      videos?: Array<{
        id?: unknown;
        view_count?: unknown;
        like_count?: unknown;
        comment_count?: unknown;
        share_count?: unknown;
      }>;
    };
  }>(response, "TikTok analytics could not be refreshed.");

  return (result.data?.videos ?? [])
    .filter(
      (video): video is typeof video & { id: string } =>
        typeof video.id === "string" && Boolean(video.id),
    )
    .map<TikTokVideoAnalytics>((video) => ({
      id: video.id,
      viewCount: readNullableSocialMetricCount(video.view_count),
      likeCount: readNullableSocialMetricCount(video.like_count),
      commentCount: readNullableSocialMetricCount(video.comment_count),
      shareCount: readNullableSocialMetricCount(video.share_count),
    }));
}
