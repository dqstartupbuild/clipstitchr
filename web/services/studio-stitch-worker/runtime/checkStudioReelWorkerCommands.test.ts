import { describe, expect, it, vi } from "vitest";
import type { StudioReelCommandRunner } from "../contracts/StudioReelCommandRunner";
import { checkStudioReelWorkerCommands } from "./checkStudioReelWorkerCommands";

describe("checkStudioReelWorkerCommands", () => {
  it("probes every configured media command without a shell or network", async () => {
    const runner = vi.fn<StudioReelCommandRunner>(async () => ({
      stderr: "",
      stdout: "version",
    }));

    await expect(
      checkStudioReelWorkerCommands({
        commands: ["ffmpeg", "ffprobe"],
        cwd: "/tmp/studio-stitch-check",
        runner,
      }),
    ).resolves.toBe(true);
    expect(runner.mock.calls.map(([operation]) => operation)).toEqual([
      {
        args: ["-version"],
        command: "ffmpeg",
        cwd: "/tmp/studio-stitch-check",
        maximumOutputBytes: 65_536,
        timeoutMs: 10_000,
      },
      {
        args: ["-version"],
        command: "ffprobe",
        cwd: "/tmp/studio-stitch-check",
        maximumOutputBytes: 65_536,
        timeoutMs: 10_000,
      },
    ]);
  });

  it("fails closed when either media command is unavailable", async () => {
    const runner = vi
      .fn()
      .mockResolvedValueOnce({ stderr: "", stdout: "version" })
      .mockRejectedValueOnce(new Error("missing"));

    await expect(
      checkStudioReelWorkerCommands({
        commands: ["ffmpeg", "ffprobe"],
        cwd: "/tmp/studio-stitch-check",
        runner,
      }),
    ).resolves.toBe(false);
  });
});
