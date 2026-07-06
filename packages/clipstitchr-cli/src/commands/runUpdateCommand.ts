import { confirm } from "@inquirer/prompts";
import { readCliPackageVersion } from "../config/readCliPackageVersion.js";
import { fetchLatestCliVersion } from "../update/fetchLatestCliVersion.js";
import { isNpmVersionGreater } from "../update/isNpmVersionGreater.js";
import { runNpmGlobalCliUpdate } from "../update/runNpmGlobalCliUpdate.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logNextCommand } from "../terminal/logNextCommand.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runUpdateCommand() {
  logBrandHeader("CLI update");

  const currentVersion = await readCliPackageVersion();
  const latestVersion = await fetchLatestCliVersion();

  logKeyValue("Installed version", currentVersion);
  logKeyValue("Latest version", latestVersion);

  if (!isNpmVersionGreater(latestVersion, currentVersion)) {
    logSuccess("ClipStitchr is up to date.");
    return;
  }

  logNextCommand("npm install -g clipstitchr@latest");

  const shouldUpdateNow = await confirm({
    default: true,
    message: "Update now with npm?",
  });

  if (!shouldUpdateNow) {
    return;
  }

  logStep("Running npm update.");
  await runNpmGlobalCliUpdate();
  logSuccess("Updated ClipStitchr CLI.");
}
