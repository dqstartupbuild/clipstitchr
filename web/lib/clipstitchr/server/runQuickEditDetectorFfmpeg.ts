import { spawn } from "node:child_process";

export function runQuickEditDetectorFfmpeg({
  args,
  maxStdoutBytes = 20_000_000,
  timeoutMs = 120_000,
}: {
  args: string[];
  maxStdoutBytes?: number;
  timeoutMs?: number;
}) {
  return new Promise<{ stderr: string; stdout: Buffer }>((resolve, reject) => {
    const process = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let stdoutBytes = 0;
    let isSettled = false;
    const timeout = setTimeout(() => {
      isSettled = true;
      process.kill("SIGKILL");
      reject(new Error("Quick Edit detector timed out."));
    }, timeoutMs);

    process.stdout.on("data", (chunk: Buffer) => {
      stdoutBytes += chunk.length;

      if (stdoutBytes > maxStdoutBytes) {
        isSettled = true;
        clearTimeout(timeout);
        process.kill("SIGKILL");
        reject(new Error("Quick Edit detector output was too large."));
        return;
      }

      stdoutChunks.push(chunk);
    });
    process.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));
    process.on("error", (error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeout);
      reject(error);
    });
    process.on("close", (code) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeout);

      const stderr = Buffer.concat(stderrChunks).toString("utf8");

      if (code !== 0) {
        reject(new Error(stderr || "Quick Edit detector failed."));
        return;
      }

      resolve({
        stderr,
        stdout: Buffer.concat(stdoutChunks),
      });
    });
  });
}
