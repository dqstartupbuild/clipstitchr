import { buildMacosWindowHelper } from "../native/macosWindowHelper/buildMacosWindowHelper.js";
import { getMacosWindowHelperExecutablePath } from "../native/macosWindowHelper/getMacosWindowHelperExecutablePath.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runNativeHelperBuildCommand() {
  logStep("Building the macOS window helper.");
  await buildMacosWindowHelper();
  logSuccess("macOS window helper built.");
  logKeyValue("Helper", getMacosWindowHelperExecutablePath());
}
