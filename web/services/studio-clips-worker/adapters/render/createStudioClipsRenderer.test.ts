import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createStudioClipsCompletionEvidence } from "../../runtime/createStudioClipsCompletionEvidence";
import type { StudioClipsR2ObjectStore } from "../r2/StudioClipsR2ObjectStore";
import { createStudioClipsRenderer } from "./createStudioClipsRenderer";

function createUnusedObjectStore(): StudioClipsR2ObjectStore {
  const unused = async (): Promise<never> => {
    throw new Error("Unexpected object-store request");
  };
  return {
    downloadFile: unused,
    getBytes: unused,
    inspectFile: unused,
    putBytesVerified: unused,
    putFileVerified: unused,
  };
}

describe("createStudioClipsRenderer", () => {
  it("applies selected caption settings with escaped filters and silent-safe audio", async () => {
    const root = await mkdtemp(join(tmpdir(), "studio-clips-render-test-"));
    const workspacePath = join(root, "clip's:workspace");
    await mkdir(workspacePath);
    const sourcePath = join(workspacePath, "source.mp4");
    await writeFile(sourcePath, "source");
    const calls: Array<{ args: readonly string[] }> = [];
    const runner = vi.fn(async (command: { args: readonly string[] }) => {
      calls.push(command);
      await writeFile(command.args.at(-1) as string, "rendered");
      return { stderr: "", stdout: "" };
    });
    const renderer = createStudioClipsRenderer({
      builtInFontsDirectory: "vendor/supoclip/v0_1_0/upstream/backend/fonts",
      evidence: createStudioClipsCompletionEvidence(),
      ffmpegPath: "ffmpeg",
      objects: createUnusedObjectStore(),
      runner,
    });

    try {
      await renderer({
        addSubtitles: true,
        captionStyle: {
          fontColorHex: "#12AB34",
          fontFamily: "TikTokSans-Regular",
          fontSizePx: 40,
          templateId: "minimal",
        },
        outputFormat: "vertical",
        ownerId: "user_123",
        productId: "product_123",
        state: {
          analysis: {
            payload: {
              candidates: [{ endSeconds: 12, id: "clip-1", startSeconds: 2 }],
              transcriptExcerpts: [
                { endSeconds: 5, startSeconds: 2, text: "Safe subtitle" },
              ],
            },
            snapshotVersion: 1,
          },
          media: {
            container: "mp4",
            contentType: "video/mp4",
            durationSeconds: 30,
            hasAudio: false,
            hasVideo: true,
            height: 1080,
            sizeBytes: 6,
            videoCodec: "h264",
            width: 1920,
          },
          source: {
            contentType: "video/mp4",
            localPath: sourcePath,
            sizeBytes: 6,
          },
        },
        workspacePath,
      });

      const args = calls[0]?.args ?? [];
      const filter = args[args.indexOf("-filter_complex") + 1];
      expect(filter).toContain("BorderStyle=3");
      expect(filter).toContain("FontName=TikTok Sans");
      expect(filter).toContain("FontSize=40");
      expect(filter).toContain("PrimaryColour=&H0034AB12&");
      expect(filter).toContain("clip\\'s\\:workspace");
      expect(args).toContain("0:a:0?");
      expect(args).toContain("-an");
      expect(args).not.toContain("-c:a");
      expect(
        args.slice(args.indexOf("-protocol_whitelist"), args.indexOf("-i")),
      ).toEqual(["-protocol_whitelist", "file,pipe"]);
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("rejects caption font IDs outside the built-in allowlist", async () => {
    const root = await mkdtemp(join(tmpdir(), "studio-clips-font-test-"));
    const sourcePath = join(root, "source.mp4");
    await writeFile(sourcePath, "source");
    const renderer = createStudioClipsRenderer({
      builtInFontsDirectory: "vendor/supoclip/v0_1_0/upstream/backend/fonts",
      evidence: createStudioClipsCompletionEvidence(),
      ffmpegPath: "ffmpeg",
      objects: createUnusedObjectStore(),
      runner: vi.fn(),
    });

    try {
      await expect(
        renderer({
          addSubtitles: true,
          captionStyle: {
            fontFamily: "../../etc/passwd",
            templateId: "default",
          },
          outputFormat: "vertical",
          ownerId: "user_123",
          productId: "product_123",
          state: {
            analysis: {
              payload: {
                candidates: [{ endSeconds: 12, id: "clip-1", startSeconds: 2 }],
                transcriptExcerpts: [
                  { endSeconds: 5, startSeconds: 2, text: "Subtitle" },
                ],
              },
              snapshotVersion: 1,
            },
            media: {
              audioCodec: "aac",
              container: "mp4",
              contentType: "video/mp4",
              durationSeconds: 30,
              hasAudio: true,
              hasVideo: true,
              height: 1080,
              sizeBytes: 6,
              videoCodec: "h264",
              width: 1920,
            },
            source: {
              contentType: "video/mp4",
              localPath: sourcePath,
              sizeBytes: 6,
            },
          },
          workspacePath: root,
        }),
      ).rejects.toMatchObject({ code: "UNSUPPORTED_CAPTION_FONT" });
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
