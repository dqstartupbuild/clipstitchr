import { writeFile } from "node:fs/promises";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import { createStudioReelLocalInputArgs } from "./createStudioReelLocalInputArgs";

export async function joinStudioReelCutSegments(input: {
  ffmpegPath: string;
  listPath: string;
  outputPath: string;
  runner: StudioReelCommandRunner;
  segmentPaths: readonly string[];
  workspacePath: string;
}) {
  const entries = input.segmentPaths
    .map((path) => `file '${path.replace(/'/g, "'\\''")}'`)
    .join("\n");
  await writeFile(input.listPath, `${entries}\n`, { flag: "wx", mode: 0o600 });
  await input.runner({
    args: [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      ...createStudioReelLocalInputArgs(input.listPath),
      "-an",
      "-c:v",
      "copy",
      "-movflags",
      "+faststart",
      input.outputPath,
    ],
    command: input.ffmpegPath,
    cwd: input.workspacePath,
    timeoutMs: 300_000,
  });
}
