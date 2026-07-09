import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { readCliOutput } from "./readCliOutput.js";

describe("demo logs commands", () => {
  it("shows logs as the primary command", () => {
    const output = readCliOutput(["demo", "--help"]);

    assert.match(output, /logs \[options\] <runId>\s+Show local logs/);
  });

  it("keeps export-log as a reachable alias", () => {
    assert.match(
      readCliOutput(["demo", "agent", "export-log", "--help"]),
      /Legacy alias for demo logs/,
    );
  });

  it("prints local evidence paths", async () => {
    const directory = await mkdtemp(join(tmpdir(), "clipstitchr-logs-"));
    const runId = "agent_run_123";
    const runDirectory = join(directory, ".clipstitchr", "agent-runs", runId);

    try {
      await mkdir(runDirectory, { recursive: true });
      await writeFile(
        join(runDirectory, "run-summary.json"),
        `${JSON.stringify({ id: runId, runDirectory })}\n`,
        "utf8",
      );

      const output = readCliOutput(["demo", "logs", runId], directory);

      assert.match(output, /Summary/);
      assert.match(output, /Action log/);
      assert.match(output, /Screenshots/);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });

  it("writes compact JSON when output is provided", async () => {
    const directory = await mkdtemp(join(tmpdir(), "clipstitchr-logs-"));
    const runId = "agent_run_123";
    const runDirectory = join(directory, ".clipstitchr", "agent-runs", runId);
    const outputPath = join(directory, "logs.json");

    try {
      await mkdir(runDirectory, { recursive: true });
      await writeFile(
        join(runDirectory, "run-summary.json"),
        `${JSON.stringify({ id: runId, runDirectory })}\n`,
        "utf8",
      );
      await writeFile(
        join(runDirectory, "action-log.jsonl"),
        `${JSON.stringify({ action: "screenshot" })}\n`,
        "utf8",
      );

      readCliOutput(["demo", "logs", runId, "--output", outputPath], directory);

      const savedLog = JSON.parse(await readFile(outputPath, "utf8")) as {
        actionLog: string;
        summary: { id: string };
      };

      assert.equal(savedLog.summary.id, runId);
      assert.match(savedLog.actionLog, /screenshot/);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });
});
