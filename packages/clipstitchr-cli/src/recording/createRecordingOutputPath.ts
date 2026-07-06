import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getRecordingsDirectoryPath } from "./getRecordingsDirectoryPath.js";

export async function createRecordingOutputPath(cwd = process.cwd()) {
  const directory = getRecordingsDirectoryPath(cwd);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  await mkdir(directory, { recursive: true });

  return join(directory, `clipstitchr-demo-${timestamp}.mp4`);
}
