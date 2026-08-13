import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createStudioClipsCompletionEvidence } from "../../runtime/createStudioClipsCompletionEvidence";
import { createStudioClipsTestRevisionClaim } from "../../testing/createStudioClipsTestRevisionClaim";
import type { StudioClipsR2ObjectStore } from "../r2/StudioClipsR2ObjectStore";
import { createStudioClipsRevisionRenderer } from "./createStudioClipsRevisionRenderer";

function createObjects(): StudioClipsR2ObjectStore {
  const unused = async (): Promise<never> => {
    throw new Error("Unexpected object store call.");
  };
  return {
    downloadFile: unused,
    getBytes: unused,
    inspectFile: unused,
    putBytesVerified: unused,
    putFileVerified: unused,
  };
}

describe("createStudioClipsRevisionRenderer", () => {
  it("renders a silent TikTok export with the exact 9:16 preset and optional audio map", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "clips-revision-export-"));
    const sourcePath = join(workspace, "source.mp4");
    await writeFile(sourcePath, "source");
    const runner = vi.fn(async (command: { args: readonly string[] }) => {
      await writeFile(command.args.at(-1) as string, "render");
      return { stderr: "", stdout: "" };
    });
    const render = createStudioClipsRevisionRenderer({
      builtInFontsDirectory: "/fonts",
      evidence: createStudioClipsCompletionEvidence(),
      ffmpegPath: "ffmpeg",
      objects: createObjects(),
      runner,
    });
    const claim = createStudioClipsTestRevisionClaim({
      operation: { kind: "platform_export", preset: "tiktok" },
    });
    try {
      await render({
        claim,
        media: [{
          container: "mp4",
          contentType: "video/mp4",
          durationSeconds: 30,
          hasAudio: false,
          hasVideo: true,
          height: 720,
          sizeBytes: 6,
          videoCodec: "h264",
          width: 1280,
        }],
        sources: [{
          contentType: "video/mp4",
          localPath: sourcePath,
          sizeBytes: 6,
          sourceOutputId: claim.sourceOutput.id,
        }],
        workspacePath: workspace,
      });
      const args = runner.mock.calls[0]![0].args;
      expect(args).toContain(
        "scale=1080:1920:force_original_aspect_ratio=decrease:flags=lanczos,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30",
      );
      expect(args.slice(args.indexOf("-maxrate"), args.indexOf("-maxrate") + 4)).toEqual([
        "-maxrate",
        "10M",
        "-bufsize",
        "20M",
      ]);
      expect(args).toContain("0:a:0?");
      expect(args).toContain("-an");
      expect(args).not.toContain("-c:a");
      expect(
        args.slice(args.indexOf("-protocol_whitelist"), args.indexOf("-i")),
      ).toEqual(["-protocol_whitelist", "file,pipe"]);
    } finally {
      await rm(workspace, { force: true, recursive: true });
    }
  });

  it("renders every split range and keeps the immutable parent output ID", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "clips-revision-split-"));
    const sourcePath = join(workspace, "source.mp4");
    await writeFile(sourcePath, "source");
    const runner = vi.fn(async (command: { args: readonly string[] }) => {
      await writeFile(command.args.at(-1) as string, "render");
      return { stderr: "", stdout: "" };
    });
    const render = createStudioClipsRevisionRenderer({
      builtInFontsDirectory: "/fonts",
      evidence: createStudioClipsCompletionEvidence(),
      ffmpegPath: "ffmpeg",
      objects: createObjects(),
      runner,
    });
    const claim = createStudioClipsTestRevisionClaim({
      operation: { kind: "split", pointsSeconds: [5, 15] },
    });
    try {
      const outputs = await render({
        claim,
        media: [{
          audioCodec: "aac",
          container: "mp4",
          contentType: "video/mp4",
          durationSeconds: 30,
          hasAudio: true,
          hasVideo: true,
          height: 1920,
          sizeBytes: 6,
          videoCodec: "h264",
          width: 1080,
        }],
        sources: [{
          contentType: "video/mp4",
          localPath: sourcePath,
          sizeBytes: 6,
          sourceOutputId: claim.sourceOutput.id,
        }],
        workspacePath: workspace,
      });
      expect(runner).toHaveBeenCalledTimes(3);
      expect(outputs).toHaveLength(3);
      expect(outputs.every((output) => output.sourceOutputId === "output_123")).toBe(true);
      expect(runner.mock.calls.map((call) => call[0].args[call[0].args.indexOf("-t") + 1])).toEqual([
        "5.000",
        "10.000",
        "15.000",
      ]);
    } finally {
      await rm(workspace, { force: true, recursive: true });
    }
  });
});
