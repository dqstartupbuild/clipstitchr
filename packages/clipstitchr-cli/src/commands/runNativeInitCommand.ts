import type { NativeInitCommandOptions } from "./NativeInitCommandOptions.js";
import { ensureMacosWindowHelperInstalled } from "../native/macosWindowHelper/ensureMacosWindowHelperInstalled.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runNativeInitCommand(
  options: NativeInitCommandOptions = {},
) {
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
