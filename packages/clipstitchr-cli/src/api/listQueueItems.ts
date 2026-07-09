import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { QueueListItem } from "../queue/QueueListItem.js";
import { requestJson } from "./requestJson.js";

export async function listQueueItems(credentials: ClipstitchrCredentials) {
  return await requestJson<{ items: QueueListItem[]; windowHours: number }>(
    credentials,
    "/api/cli/queue/list",
  );
}
