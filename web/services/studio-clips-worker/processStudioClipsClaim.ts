import { STUDIO_CLIPS_LIMITS } from "./constants/studioClipsLimits";
import type { StudioClipsBrollArtifact } from "./contracts/StudioClipsBrollArtifact";
import type { StudioClipsCheckpoint } from "./contracts/StudioClipsCheckpoint";
import type { StudioClipsPipelineState } from "./contracts/StudioClipsPipelineState";
import type { StudioClipsProcessResult } from "./contracts/StudioClipsProcessResult";
import type { StudioClipsResumePointer } from "./contracts/StudioClipsResumePointer";
import type { StudioClipsTaskStatus } from "./contracts/StudioClipsTaskStatus";
import type { StudioClipsWorkerDependencies } from "./contracts/StudioClipsWorkerDependencies";
import { getStudioClipsClaimWorkId } from "./contracts/getStudioClipsClaimWorkId";
import { StudioClipsCancellationError } from "./errors/StudioClipsCancellationError";
import { StudioClipsWorkerError } from "./errors/StudioClipsWorkerError";
import { classifyStudioClipsFailure } from "./errors/classifyStudioClipsFailure";
import { assertStudioClipsStatusTransition } from "./lifecycle/assertStudioClipsStatusTransition";
import { assertStudioClipsClaimAccess } from "./pipeline/assertStudioClipsClaimAccess";
import { createStudioClipsOutputTargets } from "./pipeline/createStudioClipsOutputTargets";
import { getStudioClipsStageShouldRun } from "./pipeline/getStudioClipsStageShouldRun";
import { persistStudioClipsCheckpoint } from "./pipeline/persistStudioClipsCheckpoint";
import { publishStudioClipsProgress } from "./pipeline/publishStudioClipsProgress";
import { throwIfStudioClipsCancelled } from "./pipeline/throwIfStudioClipsCancelled";
import { studioClipsYouTubeNavigationPolicy } from "./security/studioClipsYouTubeNavigationPolicy";
import { assertStudioClipsAnalysisArtifact } from "./validation/assertStudioClipsAnalysisArtifact";
import { assertStudioClipsBrollArtifacts } from "./validation/assertStudioClipsBrollArtifacts";
import { assertStudioClipsDurableOutputs } from "./validation/assertStudioClipsDurableOutputs";
import { assertStudioClipsInputPreflight } from "./validation/assertStudioClipsInputPreflight";
import { assertStudioClipsMediaProbe } from "./validation/assertStudioClipsMediaProbe";
import { assertStudioClipsPipelineStateFiles } from "./validation/assertStudioClipsPipelineStateFiles";
import { assertStudioClipsRenderArtifacts } from "./validation/assertStudioClipsRenderArtifacts";
import { assertStudioClipsSourceArtifact } from "./validation/assertStudioClipsSourceArtifact";
import { assertStudioClipsTranscriptArtifact } from "./validation/assertStudioClipsTranscriptArtifact";
import { readStudioClipsClaimEnvelope } from "./validation/readStudioClipsClaimEnvelope";
import { readStudioClipsPipelineStateForCheckpoint } from "./validation/readStudioClipsPipelineStateForCheckpoint";
import { assertStudioClipsLocalFileSize } from "./workspace/assertStudioClipsLocalFileSize";
import { withStudioClipsTempWorkspace } from "./workspace/withStudioClipsTempWorkspace";

export async function processStudioClipsClaim(
  rawClaim: unknown,
  dependencies: StudioClipsWorkerDependencies,
): Promise<StudioClipsProcessResult> {
  const claim = readStudioClipsClaimEnvelope(rawClaim);
  if (claim.mode !== "initial") {
    return {
      checkpoint: "claim_validated",
      failure: {
        code: "RENDER_REVISION_RUNTIME_NOT_READY",
        kind: "permanent",
        message: "The Studio Clips render revision runtime is unavailable.",
      },
      status: "error",
    };
  }
  let accessVerified = false;
  let checkpoint: StudioClipsCheckpoint =
    claim.resume?.checkpoint ?? "claim_validated";
  let resumePointer: StudioClipsResumePointer | undefined = claim.resume;
  let status: StudioClipsTaskStatus = "queued";

  try {
    await assertStudioClipsClaimAccess(claim, dependencies.access);
    accessVerified = true;
    await throwIfStudioClipsCancelled(
      claim,
      checkpoint,
      dependencies.cancellation,
    );

    assertStudioClipsStatusTransition(status, "processing");
    status = "processing";
    await publishStudioClipsProgress({
      checkpoint,
      claim,
      clock: dependencies.clock,
      code: "worker_started",
      progress: dependencies.progress,
      resume: resumePointer,
      status,
    });

    const outputs = await withStudioClipsTempWorkspace(
      async (workspace) => {
        let state: StudioClipsPipelineState = {};

        if (claim.resume) {
          const restored = await dependencies.checkpoints.restore({
            claim,
            resume: claim.resume,
            workspace,
          });
          state = readStudioClipsPipelineStateForCheckpoint({
            checkpoint: claim.resume.checkpoint,
            claim,
            state: restored,
            workspacePath: workspace.path,
          });
          await assertStudioClipsPipelineStateFiles(state);
          await workspace.assertWithinBudget();
        }

        if (getStudioClipsStageShouldRun(checkpoint, "source_acquired")) {
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          const preflight = await dependencies.pipeline.preflightSource({
            claim,
            youtubePolicy: studioClipsYouTubeNavigationPolicy,
          });
          assertStudioClipsInputPreflight(preflight);
          await dependencies.costGate.assertOwnerAndGlobalAllowed({
            attempt: claim.attempt,
            ownerId: claim.ownerId,
            productId: claim.productId,
            stage: "download",
            taskId: getStudioClipsClaimWorkId(claim),
          });
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          const source = await dependencies.pipeline.acquireSource({
            claim,
            preflight,
            workspace,
            youtubePolicy: studioClipsYouTubeNavigationPolicy,
          });
          assertStudioClipsSourceArtifact(source, workspace.path);
          await assertStudioClipsLocalFileSize(
            source.localPath,
            source.sizeBytes,
            STUDIO_CLIPS_LIMITS.inputSizeBytes,
          );

          if (
            claim.source.kind === "r2" &&
            (source.sizeBytes !== claim.source.sizeBytes ||
              source.contentType !== claim.source.contentType)
          ) {
            throw new StudioClipsWorkerError({
              code: "SOURCE_METADATA_MISMATCH",
              kind: "permanent",
              publicMessage: "The source file changed after the claim was created.",
            });
          }
          state.source = source;
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
            status,
          });
        }

        if (getStudioClipsStageShouldRun(checkpoint, "media_validated")) {
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          const source = state.source;

          if (!source) {
            throw new StudioClipsWorkerError({
              code: "MISSING_SOURCE_STATE",
              kind: "permanent",
              publicMessage: "The downloaded source is missing from the pipeline state.",
            });
          }

          const media = await dependencies.pipeline.probeMedia({
            claim,
            localPath: source.localPath,
            workspace,
          });
          assertStudioClipsMediaProbe(media);

          if (
            media.sizeBytes !== source.sizeBytes ||
            media.contentType !== source.contentType
          ) {
            throw new StudioClipsWorkerError({
              code: "SOURCE_METADATA_MISMATCH",
              kind: "permanent",
              publicMessage: "The source file metadata did not match the downloaded file.",
            });
          }
          state.media = media;
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
            status,
          });
        }

        if (getStudioClipsStageShouldRun(checkpoint, "transcribed")) {
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          await dependencies.costGate.assertOwnerAndGlobalAllowed({
            attempt: claim.attempt,
            ownerId: claim.ownerId,
            productId: claim.productId,
            stage: "transcription",
            taskId: getStudioClipsClaimWorkId(claim),
          });
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          const transcript = await dependencies.pipeline.transcribe({
            claim,
            state,
            workspace,
          });
          assertStudioClipsTranscriptArtifact(transcript);
          state.transcript = transcript;
          await workspace.assertWithinBudget();
          checkpoint = "transcribed";
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
            code: "transcribed",
            progress: dependencies.progress,
            resume: resumePointer,
            status,
          });
        }

        if (getStudioClipsStageShouldRun(checkpoint, "analyzed")) {
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          await dependencies.costGate.assertOwnerAndGlobalAllowed({
            attempt: claim.attempt,
            ownerId: claim.ownerId,
            productId: claim.productId,
            stage: "llm",
            taskId: getStudioClipsClaimWorkId(claim),
          });
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          const analysis = await dependencies.pipeline.analyze({
            claim,
            state,
            workspace,
          });
          assertStudioClipsAnalysisArtifact(analysis);
          state.analysis = analysis;
          await workspace.assertWithinBudget();
          checkpoint = "analyzed";
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
            code: "analyzed",
            progress: dependencies.progress,
            resume: resumePointer,
            status,
          });
        }

        if (getStudioClipsStageShouldRun(checkpoint, "b_roll_ready")) {
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          let broll: StudioClipsBrollArtifact[] = [];

          if (claim.options.includeBroll) {
            await dependencies.costGate.assertOwnerAndGlobalAllowed({
              attempt: claim.attempt,
              ownerId: claim.ownerId,
              productId: claim.productId,
              stage: "b_roll",
              taskId: getStudioClipsClaimWorkId(claim),
            });
            await throwIfStudioClipsCancelled(
              claim,
              checkpoint,
              dependencies.cancellation,
            );
            broll = await dependencies.pipeline.fetchBroll({
              claim,
              state,
              workspace,
            });
          }

          assertStudioClipsBrollArtifacts(broll, workspace.path);

          for (const artifact of broll) {
            await assertStudioClipsLocalFileSize(
              artifact.localPath,
              artifact.sizeBytes,
              STUDIO_CLIPS_LIMITS.brollArtifactSizeBytes,
            );
          }
          state.broll = broll;
          await workspace.assertWithinBudget();
          checkpoint = "b_roll_ready";
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
            code: "b_roll_ready",
            progress: dependencies.progress,
            resume: resumePointer,
            status,
          });
        }

        if (getStudioClipsStageShouldRun(checkpoint, "rendered")) {
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          await dependencies.costGate.assertOwnerAndGlobalAllowed({
            attempt: claim.attempt,
            ownerId: claim.ownerId,
            productId: claim.productId,
            stage: "render",
            taskId: getStudioClipsClaimWorkId(claim),
          });
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          const renders = await dependencies.pipeline.render({
            claim,
            state,
            workspace,
          });
          assertStudioClipsRenderArtifacts(renders, workspace.path);

          for (const render of renders) {
            await assertStudioClipsLocalFileSize(
              render.localPath,
              render.sizeBytes,
              STUDIO_CLIPS_LIMITS.outputSizeBytes,
            );
            const renderedMedia = await dependencies.pipeline.probeMedia({
              claim,
              localPath: render.localPath,
              workspace,
            });
            assertStudioClipsMediaProbe(renderedMedia, {
              maximumSizeBytes: STUDIO_CLIPS_LIMITS.outputSizeBytes,
              requireAudio: false,
            });

            if (
              renderedMedia.sizeBytes !== render.sizeBytes ||
              renderedMedia.contentType !== render.contentType
            ) {
              throw new StudioClipsWorkerError({
                code: "RENDER_METADATA_MISMATCH",
                kind: "permanent",
                publicMessage: "A rendered clip did not match its validated file metadata.",
              });
            }
          }

          state.renders = renders;
          await workspace.assertWithinBudget();
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
            status,
          });
        }

        if (getStudioClipsStageShouldRun(checkpoint, "output_stored")) {
          await throwIfStudioClipsCancelled(
            claim,
            checkpoint,
            dependencies.cancellation,
          );
          const renders = state.renders;

          if (!renders) {
            throw new StudioClipsWorkerError({
              code: "MISSING_RENDER_STATE",
              kind: "permanent",
              publicMessage: "The rendered clips are missing from the pipeline state.",
            });
          }

          const targets = createStudioClipsOutputTargets(claim, renders);
          const outputs = await dependencies.output.store({ claim, targets });
          assertStudioClipsDurableOutputs(outputs, {
            ownerId: claim.ownerId,
            productId: claim.productId,
            targets,
            taskId: getStudioClipsClaimWorkId(claim),
          });
          state.outputs = outputs;
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
            status,
          });
        }

        await throwIfStudioClipsCancelled(
          claim,
          checkpoint,
          dependencies.cancellation,
        );
        const outputs = state.outputs;

        if (!outputs) {
          throw new StudioClipsWorkerError({
            code: "MISSING_OUTPUT_STATE",
            kind: "permanent",
            publicMessage: "The saved clips are missing from the pipeline state.",
          });
        }

        return outputs;
      },
      dependencies.workspace,
    );

    assertStudioClipsStatusTransition(status, "completed");
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
      assertStudioClipsStatusTransition(status, "cancelled");

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
          // The result still instructs the queue adapter to persist cancellation.
        }
      }

      return {
        checkpoint: error.checkpoint,
        resume: resumePointer,
        status: "cancelled",
      };
    }

    const failure = classifyStudioClipsFailure(error, claim.attempt);
    assertStudioClipsStatusTransition(status, "error");

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
        // The returned failure remains the authoritative adapter handoff.
      }
    }

    return {
      checkpoint,
      failure,
      resume: resumePointer,
      status: "error",
    };
  }
}
