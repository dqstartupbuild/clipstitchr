import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";

type CreatePostBridgePlatformConfigurationsOptions = {
  caption: string;
  mediaIds: string[];
  platforms: PostBridgePlatform[];
  title: string;
};

export function createPostBridgePlatformConfigurations({
  caption,
  mediaIds,
  platforms,
  title,
}: CreatePostBridgePlatformConfigurationsOptions) {
  return {
    ...(platforms.includes("tiktok")
      ? {
          tiktok: {
            caption,
            media: mediaIds,
            title,
          },
        }
      : {}),
    ...(platforms.includes("instagram")
      ? {
          instagram: {
            caption,
            media: mediaIds,
          },
        }
      : {}),
    ...(platforms.includes("youtube")
      ? {
          youtube: {
            caption,
            media: mediaIds,
            title,
          },
        }
      : {}),
  };
}
