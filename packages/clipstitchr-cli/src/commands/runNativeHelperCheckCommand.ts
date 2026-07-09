import { MacosWindowHelperClient } from "../native/macosWindowHelper/MacosWindowHelperClient.js";
import { assertMacosWindowHelperPermissions } from "../native/macosWindowHelper/assertMacosWindowHelperPermissions.js";
import { createNativeWindowAutomationUnavailableMessage } from "../native/createNativeWindowAutomationUnavailableMessage.js";
import { ensureMacosWindowHelperInstalled } from "../native/macosWindowHelper/ensureMacosWindowHelperInstalled.js";
import { getNativeWindowAutomationIsAvailable } from "../native/getNativeWindowAutomationIsAvailable.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { logWarning } from "../terminal/logWarning.js";

export async function runNativeHelperCheckCommand() {
  if (!getNativeWindowAutomationIsAvailable()) {
    logWarning(createNativeWindowAutomationUnavailableMessage(process.platform));
    return;
  }

  const helper = new MacosWindowHelperClient();

  logStep("Checking the macOS window helper.");
  await ensureMacosWindowHelperInstalled();
  await helper.start();

  try {
    const status = await helper.checkPermissions(false);

    logKeyValue("Screen Recording", status.screenRecording ? "ok" : "missing");
    logKeyValue("Accessibility", status.accessibility ? "ok" : "missing");
    assertMacosWindowHelperPermissions(status);
    logSuccess("macOS window helper is ready.");
  } finally {
    await helper.stop();
  }
}
