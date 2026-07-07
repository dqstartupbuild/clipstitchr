import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDemoAgentRunPaths } from "../../dist/demoAgent/createDemoAgentRunPaths.js";

export async function withDemoAgentRunPaths(
  runFixture: (
    runPaths: ReturnType<typeof createDemoAgentRunPaths>,
  ) => Promise<void>,
) {
  const directory = await mkdtemp(join(tmpdir(), "clipstitchr-agent-run-"));

  try {
    const runPaths = createDemoAgentRunPaths("agent_run_fixture", directory);

    await mkdir(runPaths.screenshotsDirectory, { recursive: true });
    await runFixture(runPaths);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}
