import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { requestJson } from "./requestJson.js";

type QueueStitchOptions = {
  caption?: string;
  socialAccountIds?: number[];
  stitchId: string;
  title?: string;
};

export type QueueStitchResult = {
  postReference: {
    postId: string;
    status: string;
  };
};

export async function queueStitch(
  credentials: ClipstitchrCredentials,
  options: QueueStitchOptions,
) {
  return await requestJson<QueueStitchResult>(
    credentials,
    "/api/cli/queue/stitches",
    {
      body: JSON.stringify(options),
      method: "POST",
    },
  );
}
