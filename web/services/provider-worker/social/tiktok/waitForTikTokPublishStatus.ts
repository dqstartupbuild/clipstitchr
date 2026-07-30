import type { TikTokPublishStatus } from "./fetchTikTokPublishStatus";
import { fetchTikTokPublishStatus } from "./fetchTikTokPublishStatus";

export async function waitForTikTokPublishStatus(
  accessToken: string,
  publishId: string,
) {
  let status: TikTokPublishStatus | undefined;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    status = await fetchTikTokPublishStatus(accessToken, publishId);

    if (
      status.status === "PUBLISH_COMPLETE" ||
      status.status === "SEND_TO_USER_INBOX" ||
      status.status === "FAILED"
    ) {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }

  return status;
}
