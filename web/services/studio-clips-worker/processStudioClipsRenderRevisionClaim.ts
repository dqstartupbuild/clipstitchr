import { STUDIO_CLIPS_LIMITS } from "./constants/studioClipsLimits";
import type { StudioClipsCheckpoint } from "./contracts/StudioClipsCheckpoint";
import type { StudioClipsPipelineState } from "./contracts/StudioClipsPipelineState";
import type { StudioClipsProcessResult } from "./contracts/StudioClipsProcessResult";
import type { StudioClipsRenderRevisionClaimEnvelope } from "./contracts/StudioClipsRenderRevisionClaimEnvelope";
import type { StudioClipsRenderRevisionDependencies } from "./contracts/StudioClipsRenderRevisionDependencies";
import type { StudioClipsResumePointer } from "./contracts/StudioClipsResumePointer";
import { StudioClipsCancellationError } from "./errors/StudioClipsCancellationError";
import { StudioClipsWorkerError } from "./errors/StudioClipsWorkerError";
import { classifyStudioClipsFailure } from "./errors/classifyStudioClipsFailure";
import { assertStudioClipsClaimAccess } from "./pipeline/assertStudioClipsClaimAccess";
import { createStudioClipsOutputTargets } from "./pipeline/createStudioClipsOutputTargets";
import { getStudioClipsStageShouldRun } from "./pipeline/getStudioClipsStageShouldRun";
import { persistStudioClipsCheckpoint } from "./pipeline/persistStudioClipsCheckpoint";
import { publishStudioClipsProgress } from "./pipeline/publishStudioClipsProgress";
import { throwIfStudioClipsCancelled } from "./pipeline/throwIfStudioClipsCancelled";
import { assertStudioClipsDurableOutputs } from "./validation/assertStudioClipsDurableOutputs";
import { assertStudioClipsMediaProbe } from "./validation/assertStudioClipsMediaProbe";
import { assertStudioClipsPipelineStateFiles } from "./validation/assertStudioClipsPipelineStateFiles";
import { assertStudioClipsRenderArtifacts } from "./validation/assertStudioClipsRenderArtifacts";
import { assertStudioClipsLocalFileSize } from "./workspace/assertStudioClipsLocalFileSize";
import { withStudioClipsTempWorkspace } from "./workspace/withStudioClipsTempWorkspace";

export async function processStudioClipsRenderRevisionClaim(
  claim: StudioClipsRenderRevisionClaimEnvelope,
  dependencies: StudioClipsRenderRevisionDependencies,
): Promise<StudioClipsProcessResult> {
  let accessVerified = false;
  let checkpoint: StudioClipsCheckpoint =
    claim.resume?.checkpoint ?? "claim_validated";
  let resumePointer: StudioClipsResumePointer | undefined = claim.resume;
  try {
    await assertStudioClipsClaimAccess(claim, dependencies.access);
    accessVerified = true;
    await throwIfStudioClipsCancelled(claim, checkpoint, dependencies.cancellation);
    await publishStudioClipsProgress({
      checkpoint,
      claim,
      clock: dependencies.clock,
      code: "worker_started",
      progress: dependencies.progress,
      resume: resumePointer,
      status: "processing",
    });

    const outputs = await withStudioClipsTempWorkspace(async (workspace) => {
      let state: StudioClipsPipelineState = {};
      if (claim.resume) {
        state = await dependencies.checkpoints.restore({
          claim,
          resume: claim.resume,
          workspace,
        });
        await assertStudioClipsPipelineStateFiles(state);
        await workspace.assertWithinBudget();
      }

      if (getStudioClipsStageShouldRun(checkpoint, "source_acquired")) {
        await throwIfStudioClipsCancelled(claim, checkpoint, dependencies.cancellation);
        await dependencies.costGate.assertOwnerAndGlobalAllowed({
          attempt: claim.attempt,
          ownerId: claim.ownerId,
          productId: claim.productId,
          stage: "download",
          taskId: claim.renderRevisionId,
        });
        await throwIfStudioClipsCancelled(claim, checkpoint, dependencies.cancellation);
        const sources = await dependencies.acquireSources({ claim, workspace });
        if (sources.length !== claim.sourceOutputs.length) {
          throw new StudioClipsWorkerError({
            code: "REVISION_SOURCE_COUNT_MISMATCH",
            kind: "permanent",
            publicMessage: "The saved clips for this revision could not be acquired.",
          });
        }
        for (const [index, source] of sources.entries()) {
          const expected = claim.sourceOutputs[index]!;
          const selected =
            (claim.operation.kind === "captions" ||
              claim.operation.kind === "project_style") &&
            expected.cleanMaster
              ? expected.cleanMaster
              : expected;
          if (
            source.sourceOutputId !== expected.id ||
            source.contentType !== selected.contentType ||
            source.sizeBytes !== selected.sizeBytes
          ) {
            throw new StudioClipsWorkerError({
              code: "REVISION_SOURCE_METADATA_MISMATCH",
              kind: "permanent",
              publicMessage: "A saved Studio clip changed before the revision started.",
            });
          }
          await assertStudioClipsLocalFileSize(
            source.localPath,
            source.sizeBytes,
            STUDIO_CLIPS_LIMITS.outputSizeBytes,
          );
        }
        state.sources = sources;
        await workspace.assertWithinBudget();
        checkpoint = "source_acquired";
        resumePointer = await persistStudioClipsCheckpoint({
          checkpoint,
          checkpoints: dependencies.checkpoints,
          claim,
          previousRevision: resumePointer?.revision ?? 0,
          state,
          workspace,
        });
        await publishStudioClipsProgress({
          checkpoint,
          claim,
          clock: dependencies.clock,
          code: "source_acquired",
          progress: dependencies.progress,
          resume: resumePointer,
          status: "processing",
        });
      }

      if (getStudioClipsStageShouldRun(checkpoint, "media_validated")) {
        const sources = state.sources;
        if (!sources || sources.length !== claim.sourceOutputs.length) {
          throw new StudioClipsWorkerError({
            code: "MISSING_REVISION_SOURCE_STATE",
            kind: "permanent",
            publicMessage: "The downloaded revision sources are missing.",
          });
        }
        const media = [];
        for (const [index, source] of sources.entries()) {
          await throwIfStudioClipsCancelled(claim, checkpoint, dependencies.cancellation);
          const probe = await dependencies.probe({ claim, localPath: source.localPath, workspace });
          assertStudioClipsMediaProbe(probe, {
            maximumSizeBytes: STUDIO_CLIPS_LIMITS.outputSizeBytes,
            requireAudio: false,
          });
          const expected = claim.sourceOutputs[index]!;
          const selected =
            (claim.operation.kind === "captions" ||
              claim.operation.kind === "project_style") &&
            expected.cleanMaster
              ? expected.cleanMaster
              : expected;
          if (
            probe.contentType !== selected.contentType ||
            probe.sizeBytes !== selected.sizeBytes ||
            (!expected.cleanMaster &&
              (probe.width !== expected.width ||
                probe.height !== expected.height ||
                probe.hasAudio !== expected.hasAudio ||
                probe.videoCodec !== expected.videoCodec ||
                probe.audioCodec !== expected.audioCodec ||
                Math.abs(probe.durationSeconds - expected.durationSeconds) > 0.1))
          ) {
            throw new StudioClipsWorkerError({
              code: "REVISION_SOURCE_PROBE_MISMATCH",
              kind: "permanent",
              publicMessage: "A saved Studio clip did not match its immutable media facts.",
            });
          }
          media.push(probe);
        }
        state.mediaList = media;
        checkpoint = "media_validated";
        resumePointer = await persistStudioClipsCheckpoint({
          checkpoint,
          checkpoints: dependencies.checkpoints,
          claim,
          previousRevision: resumePointer?.revision ?? 0,
          state,
          workspace,
        });
        await publishStudioClipsProgress({
          checkpoint,
          claim,
          clock: dependencies.clock,
          code: "media_validated",
          progress: dependencies.progress,
          resume: resumePointer,
          status: "processing",
        });
      }

      if (getStudioClipsStageShouldRun(checkpoint, "rendered")) {
        if (!state.sources || !state.mediaList) {
          throw new StudioClipsWorkerError({
            code: "MISSING_REVISION_RENDER_STATE",
            kind: "permanent",
            publicMessage: "The revision render inputs are missing.",
          });
        }
        await dependencies.costGate.assertOwnerAndGlobalAllowed({
          attempt: claim.attempt,
          ownerId: claim.ownerId,
          productId: claim.productId,
          stage: "render",
          taskId: claim.renderRevisionId,
        });
        await throwIfStudioClipsCancelled(claim, checkpoint, dependencies.cancellation);
        const renders = await dependencies.render({
          claim,
          media: state.mediaList,
          sources: state.sources,
          workspacePath: workspace.path,
        });
        assertStudioClipsRenderArtifacts(renders, workspace.path);
        for (const render of renders) {
          const media = await dependencies.probe({
            claim,
            localPath: render.localPath,
            workspace,
          });
          assertStudioClipsMediaProbe(media, {
            maximumSizeBytes: STUDIO_CLIPS_LIMITS.outputSizeBytes,
            requireAudio: false,
          });
          if (
            media.sizeBytes !== render.sizeBytes ||
            media.contentType !== render.contentType
          ) {
            throw new StudioClipsWorkerError({
              code: "REVISION_RENDER_METADATA_MISMATCH",
              kind: "permanent",
              publicMessage: "A revised clip did not match its validated media facts.",
            });
          }
        }
        state.sources = undefined;
        state.mediaList = undefined;
        state.renders = renders;
        checkpoint = "rendered";
        resumePointer = await persistStudioClipsCheckpoint({
          checkpoint,
          checkpoints: dependencies.checkpoints,
          claim,
          previousRevision: resumePointer?.revision ?? 0,
          state,
          workspace,
        });
        await publishStudioClipsProgress({
          checkpoint,
          claim,
          clock: dependencies.clock,
          code: "rendered",
          progress: dependencies.progress,
          resume: resumePointer,
          status: "processing",
        });
      }

      if (getStudioClipsStageShouldRun(checkpoint, "output_stored")) {
        if (!state.renders) {
          throw new StudioClipsWorkerError({
            code: "MISSING_REVISION_OUTPUT_STATE",
            kind: "permanent",
            publicMessage: "The revised clips are missing before storage.",
          });
        }
        await throwIfStudioClipsCancelled(claim, checkpoint, dependencies.cancellation);
        const targets = createStudioClipsOutputTargets(claim, state.renders);
        const stored = await dependencies.output.store({ claim, targets });
        assertStudioClipsDurableOutputs(stored, {
          ownerId: claim.ownerId,
          productId: claim.productId,
          targets,
          taskId: claim.renderRevisionId,
        });
        state.outputs = stored;
        checkpoint = "output_stored";
        resumePointer = await persistStudioClipsCheckpoint({
          checkpoint,
          checkpoints: dependencies.checkpoints,
          claim,
          previousRevision: resumePointer?.revision ?? 0,
          state,
          workspace,
        });
        await publishStudioClipsProgress({
          checkpoint,
          claim,
          clock: dependencies.clock,
          code: "output_stored",
          progress: dependencies.progress,
          resume: resumePointer,
          status: "processing",
        });
      }
      if (!state.outputs) {
        throw new StudioClipsWorkerError({
          code: "MISSING_REVISION_COMPLETION_STATE",
          kind: "permanent",
          publicMessage: "The saved revision outputs are missing.",
        });
      }
      return state.outputs;
    }, dependencies.workspace);

    await publishStudioClipsProgress({
      checkpoint: "completed",
      claim,
      clock: dependencies.clock,
      code: "completed",
      progress: dependencies.progress,
      resume: resumePointer,
      status: "completed",
    });
    return { outputs, status: "completed" };
  } catch (error) {
    if (error instanceof StudioClipsCancellationError) {
      if (accessVerified) {
        try {
          await publishStudioClipsProgress({
            checkpoint: error.checkpoint,
            claim,
            clock: dependencies.clock,
            code: "cancelled",
            progress: dependencies.progress,
            resume: resumePointer,
            status: "cancelled",
          });
        } catch {
          // The caller still receives the authoritative cancellation result.
        }
      }
      return { checkpoint: error.checkpoint, resume: resumePointer, status: "cancelled" };
    }
    const failure = classifyStudioClipsFailure(error, claim.attempt);
    if (accessVerified) {
      try {
        await publishStudioClipsProgress({
          checkpoint,
          claim,
          clock: dependencies.clock,
          code: "failed",
          failure,
          progress: dependencies.progress,
          resume: resumePointer,
          status: "error",
        });
      } catch {
        // The returned failure remains authoritative for the queue adapter.
      }
    }
    return { checkpoint, failure, resume: resumePointer, status: "error" };
  }
}
