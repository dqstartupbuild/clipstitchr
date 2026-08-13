import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { StudioClipsPipelineState } from "../../contracts/StudioClipsPipelineState";
import type { StudioClipsRenderArtifact } from "../../contracts/StudioClipsRenderArtifact";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsCompletionEvidence } from "../../runtime/StudioClipsCompletionEvidence";
import { readStudioClipsBrollOpportunities } from "../broll/readStudioClipsBrollOpportunities";
import { addStudioClipsLocalProtocolGuards } from "../process/addStudioClipsLocalProtocolGuards";
import type { StudioClipsCommandRunner } from "../process/StudioClipsCommandRunner";
import type { StudioClipsR2ObjectStore } from "../r2/StudioClipsR2ObjectStore";
import { createStudioClipsSubtitleFilter } from "./createStudioClipsSubtitleFilter";
import { createStudioClipsSubtitleFile } from "./createStudioClipsSubtitleFile";
import { readStudioClipsRenderCandidates } from "./readStudioClipsRenderCandidates";
import { resolveStudioClipsCaptionStyle } from "./resolveStudioClipsCaptionStyle";
import type { StudioClipsResolvedCaptionStyle } from "./StudioClipsResolvedCaptionStyle";

export function createStudioClipsRenderer(input: {
  builtInFontsDirectory: string;
  evidence: StudioClipsCompletionEvidence;
  ffmpegPath: string;
  objects: StudioClipsR2ObjectStore;
  runner: StudioClipsCommandRunner;
}) {
  return async (request: {
    addSubtitles: boolean;
    captionStyle?: Parameters<
      typeof resolveStudioClipsCaptionStyle
    >[0]["style"];
    ownerId: string;
    outputFormat: "source" | "vertical";
    productId: string;
    state: StudioClipsPipelineState;
    workspacePath: string;
  }): Promise<StudioClipsRenderArtifact[]> => {
    const { analysis, media, source } = request.state;
    if (!analysis || !media || !source) {
      throw new StudioClipsWorkerError({
        code: "MISSING_RENDER_STATE",
        kind: "permanent",
        publicMessage: "The Studio Clips render inputs are incomplete.",
      });
    }
    const candidates = readStudioClipsRenderCandidates(
      analysis,
      media.durationSeconds,
    );
    const brollOpportunities = readStudioClipsBrollOpportunities(analysis);
    const broll = new Map(
      (request.state.broll ?? []).map((artifact) => [
        artifact.artifactId,
        artifact,
      ]),
    );
    const artifacts: StudioClipsRenderArtifact[] = [];
    const width = request.outputFormat === "vertical" ? 1080 : media.width;
    const height = request.outputFormat === "vertical" ? 1920 : media.height;
    let captionStyle: Promise<StudioClipsResolvedCaptionStyle> | undefined;

    for (const [index, candidate] of candidates.entries()) {
      const artifactId = candidate.id;
      const fileName = `studio-clip-${String(index + 1).padStart(2, "0")}.mp4`;
      const localPath = join(request.workspacePath, fileName);
      const subtitlePath = join(request.workspacePath, `${artifactId}.srt`);
      const hasSubtitles =
        request.addSubtitles &&
        (await createStudioClipsSubtitleFile({
          analysis,
          candidate,
          outputPath: subtitlePath,
        }));
      const opportunity = brollOpportunities.find(
        (item) => item.candidateId === candidate.id,
      );
      const brollArtifact = broll.get(`broll-${candidate.id}`);
      const duration = candidate.endSeconds - candidate.startSeconds;
      const commandArgs = [
        "-y",
        "-v",
        "error",
        "-ss",
        candidate.startSeconds.toFixed(3),
        "-t",
        duration.toFixed(3),
        "-i",
        source.localPath,
      ];
      if (opportunity && brollArtifact) {
        commandArgs.push("-stream_loop", "-1", "-i", brollArtifact.localPath);
      }
      const sourceArgs = [...commandArgs];

      const baseFilter =
        request.outputFormat === "vertical"
          ? "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[base]"
          : "[0:v]scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=1[base]";
      const filters = [baseFilter];
      let currentLabel = "base";
      if (opportunity && brollArtifact) {
        const start = Math.min(
          Math.max(0, opportunity.startSeconds),
          Math.max(0, duration - 0.25),
        );
        const brollDuration = Math.min(
          opportunity.durationSeconds,
          duration - start,
        );
        const end = start + brollDuration;
        filters.push(
          `[1:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},trim=duration=${brollDuration.toFixed(
            3,
          )},setpts=PTS-STARTPTS+${start.toFixed(3)}/TB[broll]`,
          `[base][broll]overlay=0:0:enable='between(t,${start.toFixed(3)},${end.toFixed(
            3,
          )})'[composite]`,
        );
        currentLabel = "composite";
      }
      if (hasSubtitles) {
        captionStyle ??= resolveStudioClipsCaptionStyle({
          builtInFontsDirectory: input.builtInFontsDirectory,
          outputHeight: height,
          ownerId: request.ownerId,
          objects: input.objects,
          productId: request.productId,
          ...(request.captionStyle ? { style: request.captionStyle } : {}),
          workspacePath: request.workspacePath,
        });
        filters.push(
          `[${currentLabel}]${createStudioClipsSubtitleFilter({
            style: await captionStyle,
            subtitlePath,
          })}[captioned]`,
        );
        currentLabel = "captioned";
      }
      commandArgs.push(
        "-filter_complex",
        filters.join(";"),
        "-map",
        `[${currentLabel}]`,
        "-map",
        "0:a:0?",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        ...(media.hasAudio ? ["-c:a", "aac", "-b:a", "192k"] : ["-an"]),
        "-movflags",
        "+faststart",
        "-shortest",
        localPath,
      );
      await input.runner({
        args: addStudioClipsLocalProtocolGuards(commandArgs),
        command: input.ffmpegPath,
        cwd: request.workspacePath,
        timeoutMs: 1_800_000,
      });
      const file = await stat(localPath);
      if (!file.isFile() || file.size < 1) {
        throw new StudioClipsWorkerError({
          code: "RENDER_OUTPUT_MISSING",
          kind: "retryable",
          publicMessage: "FFmpeg did not create a rendered clip.",
        });
      }
      input.evidence.recordRenderPath({ artifactId, fileName, localPath });
      let cleanMaster:
        | {
            contentType: string;
            fileName: string;
            localPath: string;
            sizeBytes: number;
          }
        | undefined;
      if (hasSubtitles) {
        const cleanFileName = `${artifactId}-clean.mp4`;
        const cleanPath = join(request.workspacePath, cleanFileName);
        const cleanFilters = filters.filter(
          (filter) => !filter.endsWith("[captioned]"),
        );
        const cleanLabel = cleanFilters.some((filter) =>
          filter.endsWith("[composite]"),
        )
          ? "composite"
          : "base";
        await input.runner({
          args: addStudioClipsLocalProtocolGuards([
            ...sourceArgs,
            "-filter_complex",
            cleanFilters.join(";"),
            "-map",
            `[${cleanLabel}]`,
            "-map",
            "0:a:0?",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "20",
            "-pix_fmt",
            "yuv420p",
            ...(media.hasAudio ? ["-c:a", "aac", "-b:a", "192k"] : ["-an"]),
            "-movflags",
            "+faststart",
            "-shortest",
            cleanPath,
          ]),
          command: input.ffmpegPath,
          cwd: request.workspacePath,
          timeoutMs: 1_800_000,
        });
        const cleanFile = await stat(cleanPath);
        if (!cleanFile.isFile() || cleanFile.size < 1) {
          throw new StudioClipsWorkerError({
            code: "CLEAN_MASTER_OUTPUT_MISSING",
            kind: "retryable",
            publicMessage: "FFmpeg did not create the clean caption master.",
          });
        }
        cleanMaster = {
          contentType: "video/mp4",
          fileName: cleanFileName,
          localPath: cleanPath,
          sizeBytes: cleanFile.size,
        };
      }
      artifacts.push({
        artifactId,
        contentType: "video/mp4",
        fileName,
        localPath,
        sizeBytes: file.size,
        ...(cleanMaster ? { cleanMaster } : {}),
      });
    }
    return artifacts;
  };
}
