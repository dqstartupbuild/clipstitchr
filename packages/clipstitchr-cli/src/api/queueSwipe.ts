import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { QueueContentPostResult } from "../queue/QueueContentPostResult.js";
import { requestJson } from "./requestJson.js";

type QueueSwipeOptions = {
  caption?: string;
  socialAccountIds?: number[];
  swipeId: string;
  title?: string;
};

export async function queueSwipe(
  credentials: ClipstitchrCredentials,
  options: QueueSwipeOptions,
) {
  return await requestJson<QueueContentPostResult>(
    credentials,
    "/api/cli/queue/swipes",
    {
      body: JSON.stringify(options),
      method: "POST",
    },
  );
}
