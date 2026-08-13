import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createStudioClipsTranscriptionAudio } from "./createStudioClipsTranscriptionAudio";

describe("createStudioClipsTranscriptionAudio", () => {
  it("allows only local file and pipe protocols for its source input", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "clips-transcription-"));
    const sourcePath = join(workspace, "source.mp4");
    await writeFile(sourcePath, "source");
    const runner = vi.fn(async (command: { args: readonly string[] }) => {
      await writeFile(command.args.at(-1) as string, "audio");
      return { stderr: "", stdout: "" };
    });
    const createAudio = createStudioClipsTranscriptionAudio({
      ffmpegPath: "ffmpeg",
      runner,
    });

    try {
      await createAudio(sourcePath, workspace);
      const args = runner.mock.calls[0]![0].args;
      expect(args.slice(args.indexOf("-protocol_whitelist"), args.indexOf("-i"))).toEqual([
        "-protocol_whitelist",
        "file,pipe",
      ]);
    } finally {
      await rm(workspace, { force: true, recursive: true });
    }
  });
});
