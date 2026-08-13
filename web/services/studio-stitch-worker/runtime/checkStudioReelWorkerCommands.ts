import type { StudioReelCommandRunner } from "../contracts/StudioReelCommandRunner";

export async function checkStudioReelWorkerCommands(input: {
  commands: readonly string[];
  cwd: string;
  runner: StudioReelCommandRunner;
}) {
  for (const command of input.commands) {
    try {
      await input.runner({
        args: ["-version"],
        command,
        cwd: input.cwd,
        maximumOutputBytes: 64 * 1024,
        timeoutMs: 10_000,
      });
    } catch {
      return false;
    }
  }
  return true;
}
