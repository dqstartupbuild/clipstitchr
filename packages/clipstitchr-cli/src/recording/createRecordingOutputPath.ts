import { mkdir } from "node:fs/promises";
import { join } from "node:path";

export async function createRecordingOutputPath(cwd = process.cwd()) {
  const directory = join(cwd, ".clipstitchr", "recordings");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  await mkdir(directory, { recursive: true });

  return join(directory, `clipstitchr-demo-${timestamp}.mp4`);
}
