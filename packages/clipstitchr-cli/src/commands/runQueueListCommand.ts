import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { logInfo } from "../terminal/logInfo.js";

export async function runQueueListCommand(_options: CliGlobalOptions) {
  logInfo(
    "Queue listing is coming next. For now, open the dashboard Schedule page to see upcoming posts.",
  );
}
