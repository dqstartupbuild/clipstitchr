import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("runStudioClipsWorker --check", () => {
  it(
    "exits successfully without credentials or network",
    async () => {
      const executable = join(process.cwd(), "node_modules", ".bin", "tsx");
      const entry = join(
        process.cwd(),
        "services",
        "studio-clips-worker",
        "runStudioClipsWorker.ts",
      );
      const result = await execFileAsync(executable, [entry, "--check"], {
        env: { NODE_ENV: "test", PATH: process.env.PATH ?? "" },
      });

      expect(result.stderr).toBe("");
      expect(JSON.parse(result.stdout)).toMatchObject({
        networkRequired: false,
        ok: true,
      });
    },
    60_000,
  );
});
