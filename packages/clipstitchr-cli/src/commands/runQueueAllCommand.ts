import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { getCommandCredentials } from "./getCommandCredentials.js";
import { parseSocialAccountIdsOption } from "./parseSocialAccountIdsOption.js";
import { listLibraryStitches } from "../api/listLibraryStitches.js";
import { listLibrarySwipes } from "../api/listLibrarySwipes.js";
import { queueStitch } from "../api/queueStitch.js";
import { queueSwipe } from "../api/queueSwipe.js";
import { createMixedQueueContentItems } from "../queue/createMixedQueueContentItems.js";
import { getActiveQueueableStitches } from "../queue/getActiveQueueableStitches.js";
import { getActiveQueueableSwipes } from "../queue/getActiveQueueableSwipes.js";
import { logQueueContentExecutionResults } from "../queue/logQueueContentExecutionResults.js";
import { queueContentItemsSequentially } from "../queue/queueContentItemsSequentially.js";
import { throwIfQueueContentExecutionFailed } from "../queue/throwIfQueueContentExecutionFailed.js";
import { logInfo } from "../terminal/logInfo.js";

type QueueAllCommandOptions = CliGlobalOptions & {
  accounts?: string;
  product?: string;
};

export async function runQueueAllCommand(options: QueueAllCommandOptions) {
  const credentials = await getCommandCredentials(options);
  const socialAccountIds = parseSocialAccountIdsOption(options.accounts);
  const [{ stitches }, { swipes }] = await Promise.all([
    listLibraryStitches(credentials, {
      limit: 50,
      productId: options.product,
      readyOnly: true,
    }),
    listLibrarySwipes(credentials, {
      limit: 50,
      productId: options.product,
    }),
  ]);
  const items = createMixedQueueContentItems({
    stitches: getActiveQueueableStitches(stitches),
    swipes: getActiveQueueableSwipes(swipes),
  });

  if (!items.length) {
    logInfo("No active Stitches or Swipes are ready to queue.");
    return;
  }

  const results = await queueContentItemsSequentially(items, async (item) => {
    if (item.type === "stitch") {
      return await queueStitch(credentials, {
        socialAccountIds,
        stitchId: item.item.id,
      });
    }

    return await queueSwipe(credentials, {
      socialAccountIds,
      swipeId: item.item.id,
    });
  });

  logQueueContentExecutionResults(results);
  throwIfQueueContentExecutionFailed(results);
}
