import { rm } from "node:fs/promises";
import { confirm } from "@inquirer/prompts";
import { deleteProjectConfig } from "../config/deleteProjectConfig.js";
import { hasProjectConfig } from "../config/hasProjectConfig.js";
import { getBrowserProfileDirectoryPath } from "../recording/getBrowserProfileDirectoryPath.js";
import { getRecordingsDirectoryPath } from "../recording/getRecordingsDirectoryPath.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runUnlinkCommand() {
  logBrandHeader("Disconnect this repo");

  const wasLinked = await hasProjectConfig();

  await deleteProjectConfig();

  if (wasLinked) {
    logSuccess("Removed .clipstitchr.yml.");
  } else {
    logInfo("This repo was not linked.");
  }

  const shouldRemoveBrowserProfile = await confirm({
    default: false,
    message: "Remove this repo's saved recording browser session too?",
  });

  if (shouldRemoveBrowserProfile) {
    await rm(getBrowserProfileDirectoryPath(), { force: true, recursive: true });
    logSuccess("Removed .clipstitchr/browser-profile.");
  }

  const shouldRemoveRecordings = await confirm({
    default: false,
    message: "Remove local ClipStitchr recordings from this repo?",
  });

  if (shouldRemoveRecordings) {
    await rm(getRecordingsDirectoryPath(), { force: true, recursive: true });
    logSuccess("Removed .clipstitchr/recordings.");
  }
}
