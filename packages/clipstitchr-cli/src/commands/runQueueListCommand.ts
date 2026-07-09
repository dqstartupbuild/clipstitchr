import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { listQueueItems } from "../api/listQueueItems.js";
import { createQueueListRows } from "../queue/createQueueListRows.js";
import { queueListEmptyMessage } from "../queue/queueListEmptyMessage.js";
import { logInfo } from "../terminal/logInfo.js";
import { getCommandCredentials } from "./getCommandCredentials.js";

export async function runQueueListCommand(options: CliGlobalOptions) {
  const credentials = await getCommandCredentials(options);
  const { items } = await listQueueItems(credentials);

  if (!items.length) {
    logInfo(queueListEmptyMessage);
    return;
  }

  for (const row of createQueueListRows(items)) {
    console.log(row);
  }
}
