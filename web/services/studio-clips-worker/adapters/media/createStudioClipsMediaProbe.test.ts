import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createStudioClipsCompletionEvidence } from "../../runtime/createStudioClipsCompletionEvidence";
import { createStudioClipsMediaProbe } from "./createStudioClipsMediaProbe";

describe("createStudioClipsMediaProbe", () => {
  it("returns accurate optional audio metadata for a silent rendered file", async () => {
    const workspacePath = await mkdtemp(join(tmpdir(), "studio-clips-probe-test-"));
    const localPath = join(workspacePath, "silent.mp4");
    await writeFile(localPath, "video");
    const runner = vi.fn(async (command: { args: readonly string[] }) => {
      void command;
      return {
        stderr: "",
        stdout: JSON.stringify({
          format: { duration: "10.25", format_name: "mov,mp4,m4a,3gp,3g2,mj2", size: "5" },
          streams: [{ codec_name: "h264", codec_type: "video", height: 1920, width: 1080 }],
        }),
      };
    });
    const probe = createStudioClipsMediaProbe({
      evidence: createStudioClipsCompletionEvidence(),
      ffprobePath: "ffprobe",
      runner,
    });

    try {
      await expect(probe(localPath, workspacePath)).resolves.toEqual({
        container: "mp4",
        contentType: "video/mp4",
        durationSeconds: 10.25,
        hasAudio: false,
        hasVideo: true,
        height: 1920,
        sizeBytes: 5,
        videoCodec: "h264",
        width: 1080,
      });
      const args = runner.mock.calls[0]![0].args;
      expect(args.slice(args.indexOf("-protocol_whitelist"), args.indexOf("-i"))).toEqual([
        "-protocol_whitelist",
        "file,pipe",
      ]);
    } finally {
      await rm(workspacePath, { force: true, recursive: true });
    }
  });
});
