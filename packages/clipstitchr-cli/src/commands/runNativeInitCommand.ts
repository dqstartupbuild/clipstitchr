import type { NativeInitCommandOptions } from "./NativeInitCommandOptions.js";
import { createNativeWindowAutomationUnavailableMessage } from "../native/createNativeWindowAutomationUnavailableMessage.js";
import { ensureMacosWindowHelperInstalled } from "../native/macosWindowHelper/ensureMacosWindowHelperInstalled.js";
import { getNativeWindowAutomationIsAvailable } from "../native/getNativeWindowAutomationIsAvailable.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { logWarning } from "../terminal/logWarning.js";

export async function runNativeInitCommand(
  options: NativeInitCommandOptions = {},
) {
  if (!getNativeWindowAutomationIsAvailable()) {
    logWarning(createNativeWindowAutomationUnavailableMessage(process.platform));
    return;
  }

  logStep("Preparing Mac window recording.");
  const result = await ensureMacosWindowHelperInstalled({
    force: options.force,
  });

  logSuccess(
    result.installed
      ? "Installed the macOS window helper."
      : "macOS window helper is already installed.",
  );
  logKeyValue("Helper", result.executablePath);
  logKeyValue("Helper version", result.bundleHash.slice(0, 12));
}
