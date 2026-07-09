import { MacosWindowHelperClient } from "../native/macosWindowHelper/MacosWindowHelperClient.js";
import { assertMacosWindowHelperPermissions } from "../native/macosWindowHelper/assertMacosWindowHelperPermissions.js";
import { ensureMacosWindowHelperBuilt } from "../native/macosWindowHelper/ensureMacosWindowHelperBuilt.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runNativeHelperCheckCommand() {
  const helper = new MacosWindowHelperClient();

  logStep("Checking the macOS window helper.");
  await ensureMacosWindowHelperBuilt();
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
