import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { queueStitch } from "../api/queueStitch.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { getCommandCredentials } from "./getCommandCredentials.js";
import { parseSocialAccountIdsOption } from "./parseSocialAccountIdsOption.js";
import { selectQueueStitch } from "./selectQueueStitch.js";

type QueueStitchCommandOptions = CliGlobalOptions & {
  accounts?: string;
  caption?: string;
  title?: string;
};

export async function runQueueStitchCommand(
  stitchId: string | undefined,
  options: QueueStitchCommandOptions,
) {
  const credentials = await getCommandCredentials(options);
  const stitch = stitchId ? null : await selectQueueStitch(credentials);
  const result = await queueStitch(credentials, {
    caption: options.caption,
    socialAccountIds: parseSocialAccountIdsOption(options.accounts),
    stitchId: stitchId ?? stitch?.id ?? "",
    title: options.title,
  });

  logSuccess("Added to your Post Bridge queue.");
  logKeyValue("Post ID", result.postReference.postId);
  logKeyValue("Status", result.postReference.status);
}
