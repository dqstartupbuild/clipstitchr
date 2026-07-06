import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { createStitchrBatch } from "../api/createStitchrBatch.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { getCommandCredentials } from "./getCommandCredentials.js";

type StitchrBatchCommandOptions = CliGlobalOptions & {
  sound?: string;
  template?: string;
  timeZone?: string;
};

function getLocalTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export async function runStitchrBatchCommand(
  options: StitchrBatchCommandOptions,
) {
  const credentials = await getCommandCredentials(options);
  const result = await createStitchrBatch(credentials, {
    soundTrackId: options.sound,
    templateId: options.template,
    timeZone: options.timeZone ?? getLocalTimeZone(),
  });

  logSuccess("Stitchr batch started.");
  logKeyValue("Date", result.batchDate);
  logKeyValue("Status", result.status);
  logKeyValue("Queued Stitches", String(result.count));
  logKeyValue("Run ID", result.runId);
  logKeyValue("Worker", result.providerDispatchStatus);

  if (result.message) {
    logInfo(result.message);
  }
}
