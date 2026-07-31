import { SocialApiError } from "../SocialApiError";
import { SocialOutcomeUnknownError } from "../SocialOutcomeUnknownError";
import { readSocialApiResponse } from "../readSocialApiResponse";
import type { TikTokTargetControls } from "./TikTokTargetControls";
import { getTikTokPublishErrorMessage } from "./getTikTokPublishErrorMessage";

type TikTokInitializeResponse = {
  data: {
    publish_id: string;
    upload_url?: string;
  };
};

export async function initializeTikTokPublish({
  accessToken,
  caption,
  controls,
  mediaUrls,
  publishMode,
  title,
  isPhotoPost,
}: {
  accessToken: string;
  caption: string;
  controls: TikTokTargetControls;
  mediaUrls: string[];
  publishMode: "direct" | "draft";
  title: string;
  isPhotoPost: boolean;
}) {
  const videoPostInfo = {
    title: caption,
    privacy_level: controls.privacyLevel,
    disable_comment: !controls.allowComment,
    disable_duet: !controls.allowDuet,
    disable_stitch: !controls.allowStitch,
    brand_content_toggle: controls.brandContentToggle,
    brand_organic_toggle: controls.brandOrganicToggle,
    is_aigc: controls.isAigc,
  };
  const endpoint = isPhotoPost
    ? "https://open.tiktokapis.com/v2/post/publish/content/init/"
    : publishMode === "draft"
      ? "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/"
      : "https://open.tiktokapis.com/v2/post/publish/video/init/";
  const body = isPhotoPost
    ? {
        post_info: {
          title: title.slice(0, 90),
          description: caption,
          privacy_level: controls.privacyLevel,
          disable_comment: !controls.allowComment,
          auto_add_music: controls.autoAddMusic,
          brand_content_toggle: controls.brandContentToggle,
          brand_organic_toggle: controls.brandOrganicToggle,
        },
        source_info: {
          source: "PULL_FROM_URL",
          photo_cover_index: 0,
          photo_images: mediaUrls,
        },
        post_mode: "DIRECT_POST",
        media_type: "PHOTO",
      }
    : publishMode === "draft"
      ? {
          source_info: {
            source: "PULL_FROM_URL",
            video_url: mediaUrls[0],
          },
        }
      : {
          post_info: videoPostInfo,
          source_info: {
            source: "PULL_FROM_URL",
            video_url: mediaUrls[0],
          },
        };

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new SocialOutcomeUnknownError(
      "TikTok may have accepted this post, but the reply was interrupted. ClipStitchr will not send it again automatically.",
    );
  }

  try {
    return await readSocialApiResponse<TikTokInitializeResponse>(
      response,
      "TikTok did not accept this post.",
    );
  } catch (error) {
    if (error instanceof SocialApiError && error.responseStatus >= 500) {
      throw new SocialOutcomeUnknownError(
        "TikTok may have accepted this post, but its result is unclear. ClipStitchr will not send it again automatically.",
      );
    }
    if (error instanceof SocialApiError) {
      throw new SocialApiError(
        getTikTokPublishErrorMessage({
          fallbackMessage: error.message,
          providerCode: error.providerCode,
        }),
        error.responseStatus,
        error.responseBody,
        error.retryAfterMs,
        error.providerCode,
      );
    }
    throw error;
  }
}
