import { rm } from "node:fs/promises";
import { confirm } from "@inquirer/prompts";
import { deleteProjectConfig } from "../config/deleteProjectConfig.js";
import { hasProjectConfig } from "../config/hasProjectConfig.js";
import { getBrowserProfileDirectoryPath } from "../recording/getBrowserProfileDirectoryPath.js";
import { getRecordingsDirectoryPath } from "../recording/getRecordingsDirectoryPath.js";

export async function runUnlinkCommand() {
  const wasLinked = await hasProjectConfig();

  await deleteProjectConfig();

  if (wasLinked) {
    console.log("Removed .clipstitchr.yml.");
  } else {
    console.log("This repo was not linked.");
  }

  const shouldRemoveBrowserProfile = await confirm({
    default: false,
    message: "Remove this repo's saved recording browser session too?",
  });

  if (shouldRemoveBrowserProfile) {
    await rm(getBrowserProfileDirectoryPath(), { force: true, recursive: true });
    console.log("Removed .clipstitchr/browser-profile.");
  }

  const shouldRemoveRecordings = await confirm({
    default: false,
    message: "Remove local ClipStitchr recordings from this repo?",
  });

  if (shouldRemoveRecordings) {
    await rm(getRecordingsDirectoryPath(), { force: true, recursive: true });
    console.log("Removed .clipstitchr/recordings.");
  }
}
