import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type {
  StudioClipsCommandResult,
  StudioClipsCommandRunner,
} from "./StudioClipsCommandRunner";
import { createStudioClipsChildEnvironment } from "./createStudioClipsChildEnvironment";

export class StudioClipsBoundedCommandExecution {
  readonly #child: ChildProcessByStdio<null, Readable, Readable>;
  readonly #maximumOutputBytes: number;
  readonly #stderr: Buffer[] = [];
  readonly #stdout: Buffer[] = [];
  #outputBytes = 0;
  #reject: (error: StudioClipsWorkerError) => void = () => undefined;
  #resolve: (result: StudioClipsCommandResult) => void = () => undefined;
  #settled = false;
  #timeout: ReturnType<typeof setTimeout> | undefined;

  constructor(input: Parameters<StudioClipsCommandRunner>[0]) {
    this.#maximumOutputBytes = input.maximumOutputBytes ?? 1_048_576;
    this.#child = spawn(input.command, [...input.args], {
      cwd: input.cwd,
      env: createStudioClipsChildEnvironment({
        cwd: input.cwd,
        path: process.env.PATH,
      }),
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    this.#timeout = setTimeout(() => this.#handleTimeout(), input.timeoutMs);
    this.#timeout.unref();
  }

  run(): Promise<StudioClipsCommandResult> {
    return new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
      this.#child.stdout.on("data", (chunk: Buffer) =>
        this.#capture(this.#stdout, chunk),
      );
      this.#child.stderr.on("data", (chunk: Buffer) =>
        this.#capture(this.#stderr, chunk),
      );
      this.#child.on("error", (error) =>
        this.#fail(
          new StudioClipsWorkerError({
            cause: error,
            code: "COMMAND_UNAVAILABLE",
            kind: "permanent",
            publicMessage:
              "A required Studio Clips media command is unavailable.",
          }),
        ),
      );
      this.#child.on("close", (code, signal) =>
        this.#handleClose(code, signal),
      );
    });
  }

  #capture(target: Buffer[], chunk: Buffer): void {
    this.#outputBytes += chunk.byteLength;
    if (this.#outputBytes > this.#maximumOutputBytes) {
      this.#fail(
        new StudioClipsWorkerError({
          code: "COMMAND_OUTPUT_LIMIT_EXCEEDED",
          kind: "permanent",
          publicMessage:
            "A Studio Clips media command produced too much output.",
        }),
      );
      return;
    }
    target.push(Buffer.from(chunk));
  }

  #fail(error: StudioClipsWorkerError): void {
    if (this.#settled) return;
    this.#settled = true;
    if (this.#timeout) clearTimeout(this.#timeout);
    this.#child.kill("SIGKILL");
    this.#reject(error);
  }

  #handleClose(code: number | null, signal: NodeJS.Signals | null): void {
    if (this.#timeout) clearTimeout(this.#timeout);
    if (this.#settled) return;
    this.#settled = true;
    if (code !== 0) {
      this.#reject(
        new StudioClipsWorkerError({
          code: "COMMAND_FAILED",
          kind: signal ? "retryable" : "permanent",
          publicMessage: "A Studio Clips media command could not finish.",
        }),
      );
      return;
    }
    this.#resolve({
      stderr: Buffer.concat(this.#stderr).toString("utf8"),
      stdout: Buffer.concat(this.#stdout).toString("utf8"),
    });
  }

  #handleTimeout(): void {
    this.#child.kill("SIGTERM");
    setTimeout(() => this.#child.kill("SIGKILL"), 1_000).unref();
    this.#fail(
      new StudioClipsWorkerError({
        code: "COMMAND_TIMEOUT",
        kind: "retryable",
        publicMessage: "A Studio Clips media command timed out.",
      }),
    );
  }
}
