import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { StudioClipsRenderArtifact } from "../../contracts/StudioClipsRenderArtifact";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsCompletionEvidence } from "../../runtime/StudioClipsCompletionEvidence";
import { addStudioClipsLocalProtocolGuards } from "../process/addStudioClipsLocalProtocolGuards";
import type { StudioClipsCommandRunner } from "../process/StudioClipsCommandRunner";

export async function runStudioClipsRevisionRender(input: {
  command: string[];
  evidence: StudioClipsCompletionEvidence;
  ffmpegPath: string;
  renders: StudioClipsRenderArtifact[];
  runner: StudioClipsCommandRunner;
  sourceOutputId: string;
  suffix: string;
  workspacePath: string;
}): Promise<void> {
  const artifactId = `revision-${String(input.renders.length + 1).padStart(3, "0")}`;
  const fileName = `${artifactId}-${input.suffix}.mp4`;
  const localPath = join(input.workspacePath, fileName);
  await input.runner({
    args: [...addStudioClipsLocalProtocolGuards(input.command), localPath],
    command: input.ffmpegPath,
    cwd: input.workspacePath,
    timeoutMs: 1_800_000,
  });
  const file = await stat(localPath);
  if (!file.isFile() || file.size < 1) {
    throw new StudioClipsWorkerError({
      code: "REVISION_RENDER_OUTPUT_MISSING",
      kind: "retryable",
      publicMessage: "FFmpeg did not create the revised clip.",
    });
  }
  input.evidence.recordRenderPath({ artifactId, fileName, localPath });
  input.renders.push({
    artifactId,
    contentType: "video/mp4",
    fileName,
    localPath,
    sizeBytes: file.size,
    sourceOutputId: input.sourceOutputId,
  });
}
