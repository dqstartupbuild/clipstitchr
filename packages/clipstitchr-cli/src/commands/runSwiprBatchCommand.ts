import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { createSwiprBatch } from "../api/createSwiprBatch.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { getCommandCredentials } from "./getCommandCredentials.js";
import { getProjectProductId } from "./getProjectProductId.js";

type SwiprBatchCommandOptions = CliGlobalOptions & {
  product?: string;
};

export async function runSwiprBatchCommand(options: SwiprBatchCommandOptions) {
  const credentials = await getCommandCredentials(options);
  const productId = options.product ?? (await getProjectProductId());
  const result = await createSwiprBatch(credentials, { productId });

  logSuccess("Swipr drafts queued.");
  logKeyValue("Date", result.automationDate);
  logKeyValue("Status", result.status);
  logKeyValue("Queued Swipes", String(result.count));
  logKeyValue("Run ID", result.runId);

  if (result.status === "skipped") {
    logInfo("Check your dashboard batch settings if you expected drafts.");
  }
}
