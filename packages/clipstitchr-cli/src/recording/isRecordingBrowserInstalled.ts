import { access } from "node:fs/promises";
import { chromium } from "playwright";

export async function isRecordingBrowserInstalled() {
  try {
    await access(chromium.executablePath());
    return true;
  } catch {
    return false;
  }
}
