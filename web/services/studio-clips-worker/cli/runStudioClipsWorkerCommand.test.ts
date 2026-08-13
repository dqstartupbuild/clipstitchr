import { describe, expect, it, vi } from "vitest";
import { runStudioClipsWorkerCommand } from "./runStudioClipsWorkerCommand";

describe("runStudioClipsWorkerCommand", () => {
  it("runs an offline check without credentials", async () => {
    const stdout = vi.fn();
    const stderr = vi.fn();
    const exitCode = await runStudioClipsWorkerCommand(["--check"], {
      stderr,
      stdout,
    });

    expect(exitCode).toBe(0);
    expect(stderr).not.toHaveBeenCalled();
    expect(JSON.parse(stdout.mock.calls[0][0])).toMatchObject({
      claimSchemaVersion: "studio-clips-claim-v2",
      networkRequired: false,
      ok: true,
      runtime: {
        required: { state: "unavailable" },
      },
      service: "studio-clips-worker",
    });
  });

  it("rejects an unsupported command", async () => {
    const stdout = vi.fn();
    const stderr = vi.fn();
    const exitCode = await runStudioClipsWorkerCommand([], { stderr, stdout });

    expect(exitCode).toBe(64);
    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).toHaveBeenCalledWith(expect.stringContaining("Usage"));
  });

  it("reports precise missing configuration without exposing values", async () => {
    const stdout = vi.fn();
    const stderr = vi.fn();
    const exitCode = await runStudioClipsWorkerCommand(["--once"], {
      stderr,
      stdout,
    }, { environment: { NODE_ENV: "test" } });

    expect(exitCode).toBe(78);
    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining("ASSEMBLYAI_API_KEY"),
    );
  });
});
