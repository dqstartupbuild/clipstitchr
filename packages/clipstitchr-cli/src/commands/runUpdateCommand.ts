import { confirm } from "@inquirer/prompts";
import { readCliPackageVersion } from "../config/readCliPackageVersion.js";
import { fetchLatestCliVersion } from "../update/fetchLatestCliVersion.js";
import { isNpmVersionGreater } from "../update/isNpmVersionGreater.js";
import { runNpmGlobalCliUpdate } from "../update/runNpmGlobalCliUpdate.js";

export async function runUpdateCommand() {
  const currentVersion = await readCliPackageVersion();
  const latestVersion = await fetchLatestCliVersion();

  console.log(`Installed version: ${currentVersion}`);
  console.log(`Latest version: ${latestVersion}`);

  if (!isNpmVersionGreater(latestVersion, currentVersion)) {
    console.log("ClipStitchr is up to date.");
    return;
  }

  console.log("Update command:");
  console.log("npm install -g clipstitchr@latest");

  const shouldUpdateNow = await confirm({
    default: true,
    message: "Update now with npm?",
  });

  if (!shouldUpdateNow) {
    return;
  }

  await runNpmGlobalCliUpdate();
}
