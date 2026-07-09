import type { QueueContentCommandOptions } from "./QueueContentCommandOptions.js";
import { getCommandCredentials } from "./getCommandCredentials.js";
import { parseSocialAccountIdsOption } from "./parseSocialAccountIdsOption.js";
import { listLibrarySwipes } from "../api/listLibrarySwipes.js";
import { queueSwipe } from "../api/queueSwipe.js";
import { getActiveQueueableSwipes } from "../queue/getActiveQueueableSwipes.js";
import { getLatestQueueableSwipe } from "../queue/getLatestQueueableSwipe.js";
import { logQueueContentExecutionResults } from "../queue/logQueueContentExecutionResults.js";
import { queueContentItemsSequentially } from "../queue/queueContentItemsSequentially.js";
import { throwIfQueueContentExecutionFailed } from "../queue/throwIfQueueContentExecutionFailed.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logInfo } from "../terminal/logInfo.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runQueueSwipeCommand(
  swipeId: string | undefined,
  options: QueueContentCommandOptions,
) {
  const credentials = await getCommandCredentials(options);
  const socialAccountIds = parseSocialAccountIdsOption(options.accounts);

  if (options.all) {
    const { swipes } = await listLibrarySwipes(credentials, {
      limit: 50,
      productId: options.product,
    });
    const items = getActiveQueueableSwipes(swipes).map((swipe) => ({
      item: swipe,
      type: "swipe" as const,
    }));

    if (!items.length) {
      logInfo("No ready active Swipes found.");
      return;
    }

    const results = await queueContentItemsSequentially(items, async (item) => {
      return await queueSwipe(credentials, {
        caption: options.caption,
        socialAccountIds,
        swipeId: item.item.id,
        title: options.title,
      });
    });

    logQueueContentExecutionResults(results);
    throwIfQueueContentExecutionFailed(results);
    return;
  }

  const selectedSwipeId =
    swipeId ??
    getLatestQueueableSwipe(
      (
        await listLibrarySwipes(credentials, {
          limit: 50,
          productId: options.product,
        })
      ).swipes,
    ).id;
  const result = await queueSwipe(credentials, {
    caption: options.caption,
    socialAccountIds,
    swipeId: selectedSwipeId,
    title: options.title,
  });

  logSuccess("Added to your Post Bridge queue.");
  logKeyValue("Post ID", result.postReference.postId);
  logKeyValue("Status", result.postReference.status);
}
