import { createInstagramContainer } from "./createInstagramContainer";

export async function createInstagramMediaContainer({
  accessToken,
  accountId,
  caption,
  isVideo,
  mediaUrls,
  shareToFeed,
}: {
  accessToken: string;
  accountId: string;
  caption: string;
  isVideo: boolean;
  mediaUrls: string[];
  shareToFeed: boolean;
}) {
  if (isVideo) {
    return await createInstagramContainer(accountId, accessToken, {
      caption,
      media_type: "REELS",
      share_to_feed: String(shareToFeed),
      video_url: mediaUrls[0],
    });
  }

  if (mediaUrls.length === 1) {
    return await createInstagramContainer(accountId, accessToken, {
      caption,
      image_url: mediaUrls[0],
    });
  }

  const childIds: string[] = [];

  for (const mediaUrl of mediaUrls) {
    const child = await createInstagramContainer(accountId, accessToken, {
      image_url: mediaUrl,
      is_carousel_item: "true",
    });
    childIds.push(child.id);
  }

  return await createInstagramContainer(accountId, accessToken, {
    caption,
    children: childIds.join(","),
    media_type: "CAROUSEL",
  });
}
