import { getInstagramGraphApiVersion } from "@/lib/clipstitchr/social/getInstagramGraphApiVersion";
import { readSocialApiResponse } from "../../readSocialApiResponse";
import { readNullableSocialMetricCount } from "../readNullableSocialMetricCount";

export type InstagramMediaMetadata = {
  commentsCount: number | null;
  likeCount: number | null;
  mediaProductType?: string;
  mediaType: string;
};

export async function fetchInstagramMediaMetadata(
  mediaId: string,
  accessToken: string,
) {
  const url = new URL(
    `https://graph.instagram.com/${getInstagramGraphApiVersion()}/${encodeURIComponent(mediaId)}`,
  );
  url.searchParams.set(
    "fields",
    "media_type,media_product_type,like_count,comments_count",
  );
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url);
  const result = await readSocialApiResponse<{
    media_type?: unknown;
    media_product_type?: unknown;
    like_count?: unknown;
    comments_count?: unknown;
  }>(response, "Instagram post details could not be refreshed.");

  if (typeof result.media_type !== "string" || !result.media_type) {
    throw new Error("Instagram did not return this post's media type.");
  }

  return {
    mediaType: result.media_type,
    mediaProductType:
      typeof result.media_product_type === "string"
        ? result.media_product_type
        : undefined,
    likeCount: readNullableSocialMetricCount(result.like_count),
    commentsCount: readNullableSocialMetricCount(result.comments_count),
  } satisfies InstagramMediaMetadata;
}
