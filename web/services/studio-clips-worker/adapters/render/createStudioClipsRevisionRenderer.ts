import { join } from "node:path";
import type { StudioClipsRenderRevisionClaimEnvelope } from "../../contracts/StudioClipsRenderRevisionClaimEnvelope";
import type { StudioClipsMediaProbe } from "../../contracts/StudioClipsMediaProbe";
import type { StudioClipsRenderArtifact } from "../../contracts/StudioClipsRenderArtifact";
import type { StudioClipsRevisionSourceArtifact } from "../../contracts/StudioClipsRevisionSourceArtifact";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsCompletionEvidence } from "../../runtime/StudioClipsCompletionEvidence";
import type { StudioClipsCommandRunner } from "../process/StudioClipsCommandRunner";
import type { StudioClipsR2ObjectStore } from "../r2/StudioClipsR2ObjectStore";
import { createStudioClipsCaptionCueFile } from "./createStudioClipsCaptionCueFile";
import { createStudioClipsSubtitleFilter } from "./createStudioClipsSubtitleFilter";
import { getStudioClipsRevisionEncodeArgs } from "./getStudioClipsRevisionEncodeArgs";
import { getStudioClipsPlatformRenderPreset } from "./getStudioClipsPlatformRenderPreset";
import { renderSingleStudioClipsRevision } from "./renderSingleStudioClipsRevision";
import { resolveStudioClipsCaptionStyle } from "./resolveStudioClipsCaptionStyle";
import { runStudioClipsRevisionRender } from "./runStudioClipsRevisionRender";

export function createStudioClipsRevisionRenderer(input: {
  builtInFontsDirectory: string;
  evidence: StudioClipsCompletionEvidence;
  ffmpegPath: string;
  objects: StudioClipsR2ObjectStore;
  runner: StudioClipsCommandRunner;
}) {
  return async (request: {
    claim: StudioClipsRenderRevisionClaimEnvelope;
    media: StudioClipsMediaProbe[];
    sources: StudioClipsRevisionSourceArtifact[];
    workspacePath: string;
  }): Promise<StudioClipsRenderArtifact[]> => {
    if (
      request.sources.length !== request.claim.sourceOutputs.length ||
      request.media.length !== request.sources.length
    ) {
      throw new StudioClipsWorkerError({
        code: "REVISION_SOURCE_STATE_INVALID",
        kind: "permanent",
        publicMessage:
          "The saved clips for this revision could not be validated.",
      });
    }
    const operation = request.claim.operation;
    if (operation.kind === "regenerate" && operation.instructions) {
      throw new StudioClipsWorkerError({
        code: "REGENERATION_PROVIDER_UNAVAILABLE",
        kind: "permanent",
        publicMessage:
          "Free-text regeneration is not configured. Remove the instructions to create a clean deterministic rerender.",
      });
    }
    const renders: StudioClipsRenderArtifact[] = [];

    if (operation.kind === "trim") {
      if (operation.endSeconds > request.media[0]!.durationSeconds + 0.05) {
        throw new StudioClipsWorkerError({
          code: "TRIM_RANGE_OUTSIDE_SOURCE",
          kind: "permanent",
          publicMessage: "The trim range is outside the saved clip.",
        });
      }
      await renderSingleStudioClipsRevision({
        evidence: input.evidence,
        ffmpegPath: input.ffmpegPath,
        inputArgs: [
          "-ss",
          operation.startSeconds.toFixed(3),
          "-t",
          (operation.endSeconds - operation.startSeconds).toFixed(3),
        ],
        media: request.media[0]!,
        renders,
        runner: input.runner,
        source: request.sources[0]!,
        suffix: "trim",
        workspacePath: request.workspacePath,
      });
      return renders;
    }

    if (operation.kind === "split") {
      const duration = request.media[0]!.durationSeconds;
      if (operation.pointsSeconds.some((point) => point >= duration - 0.05)) {
        throw new StudioClipsWorkerError({
          code: "SPLIT_POINT_OUTSIDE_SOURCE",
          kind: "permanent",
          publicMessage: "A split point is outside the saved clip.",
        });
      }
      const boundaries = [0, ...operation.pointsSeconds, duration];
      for (let index = 0; index < boundaries.length - 1; index += 1) {
        const start = boundaries[index]!;
        const end = boundaries[index + 1]!;
        await renderSingleStudioClipsRevision({
          evidence: input.evidence,
          ffmpegPath: input.ffmpegPath,
          inputArgs: ["-ss", start.toFixed(3), "-t", (end - start).toFixed(3)],
          media: request.media[0]!,
          renders,
          runner: input.runner,
          source: request.sources[0]!,
          suffix: `split-${String(index + 1).padStart(3, "0")}`,
          workspacePath: request.workspacePath,
        });
      }
      return renders;
    }

    if (operation.kind === "merge") {
      const audioStates = new Set(request.media.map((media) => media.hasAudio));
      if (audioStates.size > 1) {
        throw new StudioClipsWorkerError({
          code: "MIXED_AUDIO_MERGE_UNSUPPORTED",
          kind: "permanent",
          publicMessage:
            "Merge clips that either all have audio or are all silent.",
        });
      }
      const hasAudio = request.media[0]!.hasAudio;
      const inputs = request.sources.flatMap((source) => [
        "-i",
        source.localPath,
      ]);
      const filterInputs = request.sources.map((_, index) =>
        hasAudio
          ? `[${index}:v:0]setpts=PTS-STARTPTS[v${index}];[${index}:a:0]asetpts=PTS-STARTPTS[a${index}]`
          : `[${index}:v:0]setpts=PTS-STARTPTS[v${index}]`,
      );
      const concatInputs = request.sources
        .map((_, index) =>
          hasAudio ? `[v${index}][a${index}]` : `[v${index}]`,
        )
        .join("");
      const concat = `${concatInputs}concat=n=${request.sources.length}:v=1:a=${hasAudio ? 1 : 0}[vout]${hasAudio ? "[aout]" : ""}`;
      await runStudioClipsRevisionRender({
        command: [
          "-y",
          "-v",
          "error",
          ...inputs,
          "-filter_complex",
          [...filterInputs, concat].join(";"),
          "-map",
          "[vout]",
          ...(hasAudio ? ["-map", "[aout]"] : []),
          ...getStudioClipsRevisionEncodeArgs(hasAudio),
        ],
        evidence: input.evidence,
        ffmpegPath: input.ffmpegPath,
        renders,
        runner: input.runner,
        sourceOutputId: request.sources[0]!.sourceOutputId,
        suffix: "merge",
        workspacePath: request.workspacePath,
      });
      return renders;
    }

    if (operation.kind === "platform_export") {
      const preset = getStudioClipsPlatformRenderPreset(operation.preset);
      if (
        request.media[0]!.durationSeconds >
        preset.maximumDurationSeconds + 0.05
      ) {
        throw new StudioClipsWorkerError({
          code: "PLATFORM_EXPORT_DURATION_UNSUPPORTED",
          kind: "permanent",
          publicMessage:
            "This clip is longer than the selected export preset allows.",
        });
      }
      const source = request.sources[0]!;
      const media = request.media[0]!;
      await runStudioClipsRevisionRender({
        command: [
          "-y",
          "-v",
          "error",
          "-i",
          source.localPath,
          "-vf",
          `scale=${preset.width}:${preset.height}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${preset.frameRate}`,
          "-map",
          "0:v:0",
          "-map",
          "0:a:0?",
          "-c:v",
          preset.videoCodec,
          "-preset",
          "slow",
          "-crf",
          "18",
          "-maxrate",
          preset.videoMaximumRate,
          "-bufsize",
          preset.videoBufferSize,
          "-pix_fmt",
          preset.pixelFormat,
          "-profile:v",
          "high",
          ...(media.hasAudio
            ? [
                "-c:a",
                preset.audioCodec,
                "-b:a",
                preset.audioBitrate,
                "-ar",
                "48000",
              ]
            : ["-an"]),
          "-movflags",
          "+faststart",
        ],
        evidence: input.evidence,
        ffmpegPath: input.ffmpegPath,
        renders,
        runner: input.runner,
        sourceOutputId: source.sourceOutputId,
        suffix: preset.fileSuffix,
        workspacePath: request.workspacePath,
      });
      return renders;
    }

    if (operation.kind === "captions" || operation.kind === "project_style") {
      const style =
        operation.kind === "project_style" ? operation.style : operation.style;
      for (const [index, source] of request.sources.entries()) {
        const sourceSnapshot = request.claim.sourceOutputs[index]!;
        if (sourceSnapshot.captionsBurned && !sourceSnapshot.cleanMaster) {
          throw new StudioClipsWorkerError({
            code: "CLEAN_CAPTION_MASTER_UNAVAILABLE",
            kind: "permanent",
            publicMessage:
              "This older clip has burned-in captions and no clean master for restyling.",
          });
        }
        const wantsCaptions =
          operation.kind === "project_style" ||
          (operation.enabled && operation.burnIn);
        if (!wantsCaptions) {
          await renderSingleStudioClipsRevision({
            evidence: input.evidence,
            ffmpegPath: input.ffmpegPath,
            inputArgs: [],
            media: request.media[index]!,
            renders,
            runner: input.runner,
            source,
            suffix: "captions-off",
            workspacePath: request.workspacePath,
          });
          continue;
        }
        const cues = sourceSnapshot.captionCues ?? [];
        if (cues.length === 0) {
          throw new StudioClipsWorkerError({
            code: "CAPTION_TIMING_UNAVAILABLE",
            kind: "permanent",
            publicMessage:
              "This clip does not have word timing for a caption rerender.",
          });
        }
        const subtitlePath = join(
          request.workspacePath,
          `revision-captions-${index + 1}.srt`,
        );
        await createStudioClipsCaptionCueFile({
          cues,
          outputPath: subtitlePath,
        });
        const resolved = await resolveStudioClipsCaptionStyle({
          builtInFontsDirectory: input.builtInFontsDirectory,
          outputHeight: request.media[index]!.height,
          ownerId: request.claim.ownerId,
          objects: input.objects,
          productId: request.claim.productId,
          ...(style ? { style } : {}),
          workspacePath: request.workspacePath,
        });
        const cleanMaster = sourceSnapshot.cleanMaster
          ? {
              contentType: source.contentType,
              fileName: `clean-master-${sourceSnapshot.id}.mp4`,
              localPath: source.localPath,
              sizeBytes: source.sizeBytes,
            }
          : undefined;
        await runStudioClipsRevisionRender({
          command: [
            "-y",
            "-v",
            "error",
            "-i",
            source.localPath,
            "-vf",
            createStudioClipsSubtitleFilter({ style: resolved, subtitlePath }),
            "-map",
            "0:v:0",
            "-map",
            "0:a:0?",
            ...getStudioClipsRevisionEncodeArgs(request.media[index]!.hasAudio),
          ],
          evidence: input.evidence,
          ffmpegPath: input.ffmpegPath,
          renders,
          runner: input.runner,
          sourceOutputId: source.sourceOutputId,
          suffix: "captions",
          workspacePath: request.workspacePath,
        });
        if (cleanMaster) {
          renders[renders.length - 1]!.cleanMaster = cleanMaster;
        }
      }
      return renders;
    }

    await renderSingleStudioClipsRevision({
      evidence: input.evidence,
      ffmpegPath: input.ffmpegPath,
      inputArgs: [],
      media: request.media[0]!,
      renders,
      runner: input.runner,
      source: request.sources[0]!,
      suffix: "regenerated",
      workspacePath: request.workspacePath,
    });
    return renders;
  };
}
