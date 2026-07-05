import { createPostBridgePlatformConfigurations } from "@/lib/clipstitchr/server/postBridge/createPostBridgePlatformConfigurations";
import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

type CreatePostBridgePostOptions = {
  apiKey: string;
  caption: string;
  mediaIds: string[];
  platforms: PostBridgePlatform[];
  scheduledAt: string | null;
  socialAccountIds: number[];
  tiktokCaption?: string;
  title: string;
  useQueue: boolean;
};

export async function createPostBridgePost({
  apiKey,
  caption,
  mediaIds,
  platforms,
  scheduledAt,
  socialAccountIds,
  tiktokCaption,
  title,
  useQueue,
}: CreatePostBridgePostOptions) {
  return await requestPostBridge<PostBridgePost>("/v1/posts", {
    apiKey,
    body: {
      caption,
      media: mediaIds,
      platform_configurations: createPostBridgePlatformConfigurations({
        caption,
        mediaIds,
        platforms,
        tiktokCaption,
        title,
      }),
      processing_enabled: true,
      social_accounts: socialAccountIds,
      ...(useQueue ? { use_queue: true } : { scheduled_at: scheduledAt }),
    },
    method: "POST",
  });
}
