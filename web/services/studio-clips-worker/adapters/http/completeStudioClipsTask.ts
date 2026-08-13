import type { StudioClipsClaimEnvelope } from "../../contracts/StudioClipsClaimEnvelope";
import { getStudioClipsClaimWorkId } from "../../contracts/getStudioClipsClaimWorkId";
import type { StudioClipsDurableOutput } from "../../contracts/StudioClipsDurableOutput";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsCompletionEvidence } from "../../runtime/StudioClipsCompletionEvidence";
import type { StudioClipsWorkerHttpClient } from "./StudioClipsWorkerHttpClient";

export async function completeStudioClipsTask(input: {
  claim: StudioClipsClaimEnvelope;
  evidence: StudioClipsCompletionEvidence;
  http: StudioClipsWorkerHttpClient;
  outputs: StudioClipsDurableOutput[];
}): Promise<void> {
  const outputs = input.outputs.map((output) => {
    const render = input.evidence.getRender(output.artifactId);
    if (!render) {
      throw new StudioClipsWorkerError({
        code: "MISSING_COMPLETION_MEDIA_EVIDENCE",
        kind: "retryable",
        publicMessage: "A generated clip is missing its verified media details.",
      });
    }

    return {
      ...output,
      ...(render.media.audioCodec
        ? { audioCodec: render.media.audioCodec }
        : {}),
      durationSeconds: render.media.durationSeconds,
      fileName: render.fileName,
      hasAudio: render.media.hasAudio,
      height: render.media.height,
      videoCodec: render.media.videoCodec,
      width: render.media.width,
    };
  });

  await input.http.post("/api/studio/clips/worker/complete", {
    ...(input.evidence.getAnalysis()
      ? { analysis: input.evidence.getAnalysis() }
      : {}),
    attempt: input.claim.attempt,
    leaseId: input.claim.leaseId,
    outputs,
    ownerId: input.claim.ownerId,
    productId: input.claim.productId,
    taskId: getStudioClipsClaimWorkId(input.claim),
  });
}
