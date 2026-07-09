import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createInterface, type Interface } from "node:readline";
import type { MacosWindowInfo } from "./MacosWindowInfo.js";
import type { MacosWindowPermissionStatus } from "./MacosWindowPermissionStatus.js";
import type { MacosWindowScreenshot } from "./MacosWindowScreenshot.js";
import { getMacosWindowHelperExecutablePath } from "./getMacosWindowHelperExecutablePath.js";

type PendingRequest = {
  reject(error: Error): void;
  resolve(value: unknown): void;
};

type HelperResponse = {
  error?: string;
  id: string;
  ok: boolean;
  result?: unknown;
};

export class MacosWindowHelperClient {
  private child?: ChildProcessWithoutNullStreams;
  private nextId = 1;
  private pending = new Map<string, PendingRequest>();
  private reader?: Interface;

  async start() {
    if (this.child) {
      return;
    }

    this.child = spawn(getMacosWindowHelperExecutablePath(), [], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.reader = createInterface({ input: this.child.stdout });

    this.reader.on("line", (line) => {
      this.handleLine(line);
    });
    this.child.once("exit", () => {
      this.rejectAll(new Error("macOS helper exited."));
    });
  }

  async stop() {
    this.reader?.close();
    this.child?.kill();
    this.child = undefined;
    this.reader = undefined;
    this.rejectAll(new Error("macOS helper stopped."));
  }

  async captureWindow() {
    return (await this.command("capture_window")) as MacosWindowScreenshot;
  }

  async checkPermissions(prompt = false) {
    return (await this.command("check_permissions", {
      prompt,
    })) as MacosWindowPermissionStatus;
  }

  async click(input: { button?: string; x: number; y: number }) {
    await this.command("click", input);
  }

  async doubleClick(input: { button?: string; x: number; y: number }) {
    await this.command("double_click", input);
  }

  async drag(path: Array<{ x: number; y: number }>) {
    await this.command("drag", { path });
  }

  async keypress(keys: string[]) {
    await this.command("keypress", { keys });
  }

  async listWindows() {
    const result = (await this.command("list_windows")) as {
      windows?: MacosWindowInfo[];
    };

    return result.windows ?? [];
  }

  async move(input: { x: number; y: number }) {
    await this.command("move", input);
  }

  async scroll(input: {
    scrollX?: number;
    scrollY?: number;
    x: number;
    y: number;
  }) {
    await this.command("scroll", input);
  }

  async selectWindow(input: { match?: string; windowId?: number }) {
    const result = (await this.command("select_window", input)) as {
      window?: MacosWindowInfo;
    };

    if (!result.window) {
      throw new Error("The helper did not return the selected window.");
    }

    return result.window;
  }

  async typeText(text: string) {
    await this.command("type_text", { text });
  }

  async wait(milliseconds = 2000) {
    await this.command("wait", { milliseconds });
  }

  private async command(command: string, params: Record<string, unknown> = {}) {
    if (!this.child) {
      throw new Error("macOS helper is not running.");
    }

    const id = String(this.nextId++);
    const request = JSON.stringify({ command, id, params });

    return await new Promise<unknown>((resolve, reject) => {
      this.pending.set(id, { reject, resolve });
      this.child?.stdin.write(`${request}\n`, (error) => {
        if (error) {
          this.pending.delete(id);
          reject(error);
        }
      });
    });
  }

  private handleLine(line: string) {
    let response: HelperResponse;

    try {
      response = JSON.parse(line) as HelperResponse;
    } catch {
      return;
    }

    const pending = this.pending.get(response.id);

    if (!pending) {
      return;
    }

    this.pending.delete(response.id);

    if (!response.ok) {
      pending.reject(new Error(response.error ?? "macOS helper command failed."));
      return;
    }

    pending.resolve(response.result);
  }

  private rejectAll(error: Error) {
    for (const pending of this.pending.values()) {
      pending.reject(error);
    }

    this.pending.clear();
  }
}
