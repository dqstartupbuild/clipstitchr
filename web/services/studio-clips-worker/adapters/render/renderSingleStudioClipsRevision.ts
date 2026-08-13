import type { StudioClipsMediaProbe } from "../../contracts/StudioClipsMediaProbe";
import type { StudioClipsRenderArtifact } from "../../contracts/StudioClipsRenderArtifact";
import type { StudioClipsRevisionSourceArtifact } from "../../contracts/StudioClipsRevisionSourceArtifact";
import type { StudioClipsCompletionEvidence } from "../../runtime/StudioClipsCompletionEvidence";
import type { StudioClipsCommandRunner } from "../process/StudioClipsCommandRunner";
import { getStudioClipsRevisionEncodeArgs } from "./getStudioClipsRevisionEncodeArgs";
import { runStudioClipsRevisionRender } from "./runStudioClipsRevisionRender";

export async function renderSingleStudioClipsRevision(input: {
  evidence: StudioClipsCompletionEvidence;
  ffmpegPath: string;
  inputArgs: string[];
  media: StudioClipsMediaProbe;
  renders: StudioClipsRenderArtifact[];
  runner: StudioClipsCommandRunner;
  source: StudioClipsRevisionSourceArtifact;
  suffix: string;
  workspacePath: string;
}): Promise<void> {
  await runStudioClipsRevisionRender({
    command: [
      "-y",
      "-v",
      "error",
      ...input.inputArgs,
      "-i",
      input.source.localPath,
      "-map",
      "0:v:0",
      "-map",
      "0:a:0?",
      ...getStudioClipsRevisionEncodeArgs(input.media.hasAudio),
    ],
    evidence: input.evidence,
    ffmpegPath: input.ffmpegPath,
    renders: input.renders,
    runner: input.runner,
    sourceOutputId: input.source.sourceOutputId,
    suffix: input.suffix,
    workspacePath: input.workspacePath,
  });
}
