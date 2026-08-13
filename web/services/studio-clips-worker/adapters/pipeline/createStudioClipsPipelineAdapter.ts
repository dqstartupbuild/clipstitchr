import type { StudioClipsPipelineAdapter } from "../../contracts/StudioClipsPipelineAdapter";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsCompletionEvidence } from "../../runtime/StudioClipsCompletionEvidence";
import type { StudioClipsLeaseHeartbeat } from "../../runtime/StudioClipsLeaseHeartbeat";
import type { StudioClipsAnalysisProvider } from "../analysis/StudioClipsAnalysisProvider";
import type { StudioClipsTranscriptionProvider } from "../providers/StudioClipsTranscriptionProvider";

export function createStudioClipsPipelineAdapter(input: {
  acquireR2: (request: {
    claim: Parameters<StudioClipsPipelineAdapter["acquireSource"]>[0]["claim"];
    workspacePath: string;
  }) => ReturnType<StudioClipsPipelineAdapter["acquireSource"]>;
  acquireYouTube: (request: {
    claim: Parameters<StudioClipsPipelineAdapter["acquireSource"]>[0]["claim"];
    policy: Parameters<
      StudioClipsPipelineAdapter["acquireSource"]
    >[0]["youtubePolicy"];
    workspacePath: string;
  }) => ReturnType<StudioClipsPipelineAdapter["acquireSource"]>;
  analysis: StudioClipsAnalysisProvider;
  broll: (
    state: Parameters<StudioClipsPipelineAdapter["fetchBroll"]>[0]["state"],
    workspacePath: string,
  ) => ReturnType<StudioClipsPipelineAdapter["fetchBroll"]>;
  createTranscriptionAudio: (
    sourcePath: string,
    workspacePath: string,
  ) => Promise<string>;
  evidence: StudioClipsCompletionEvidence;
  heartbeat: StudioClipsLeaseHeartbeat;
  preflight: StudioClipsPipelineAdapter["preflightSource"];
  probe: (
    localPath: string,
    workspacePath: string,
  ) => ReturnType<StudioClipsPipelineAdapter["probeMedia"]>;
  render: (request: {
    addSubtitles: boolean;
    captionStyle?: Parameters<
      StudioClipsPipelineAdapter["render"]
    >[0]["claim"]["options"]["captionStyle"];
    ownerId: string;
    outputFormat: "source" | "vertical";
    productId: string;
    state: Parameters<StudioClipsPipelineAdapter["render"]>[0]["state"];
    workspacePath: string;
  }) => ReturnType<StudioClipsPipelineAdapter["render"]>;
  transcription: StudioClipsTranscriptionProvider;
}): StudioClipsPipelineAdapter {
  return {
    acquireSource: async ({ claim, workspace, youtubePolicy }) =>
      input.heartbeat.run({
        checkpoint: "claim_validated",
        code: "worker_started",
        operation: () =>
          claim.source.kind === "youtube"
            ? input.acquireYouTube({
                claim,
                policy: youtubePolicy,
                workspacePath: workspace.path,
              })
            : input.acquireR2({ claim, workspacePath: workspace.path }),
      }),
    analyze: async ({ claim, state }) => {
      if (!state.media || !state.transcript) {
        throw new StudioClipsWorkerError({
          code: "MISSING_ANALYSIS_STATE",
          kind: "permanent",
          publicMessage: "The clip analysis inputs are incomplete.",
        });
      }
      const analysis = await input.heartbeat.run({
        checkpoint: "transcribed",
        code: "transcribed",
        operation: () =>
          input.analysis.analyze({
            claim,
            durationSeconds: state.media!.durationSeconds,
            transcript: state.transcript!.text,
          }),
      });
      input.evidence.recordAnalysis(analysis.payload);
      return analysis;
    },
    fetchBroll: async ({ state, workspace }) =>
      input.heartbeat.run({
        checkpoint: "analyzed",
        code: "analyzed",
        operation: () => input.broll(state, workspace.path),
      }),
    preflightSource: input.preflight,
    probeMedia: async ({ localPath, workspace }) =>
      input.probe(localPath, workspace.path),
    render: async ({ claim, state, workspace }) =>
      input.heartbeat.run({
        checkpoint: "b_roll_ready",
        code: "b_roll_ready",
        operation: () =>
          input.render({
            addSubtitles: claim.options.addSubtitles,
            ...(claim.options.captionStyle
              ? { captionStyle: claim.options.captionStyle }
              : {}),
            ownerId: claim.ownerId,
            outputFormat: claim.options.outputFormat,
            productId: claim.productId,
            state,
            workspacePath: workspace.path,
          }),
      }),
    transcribe: async ({ state, workspace }) => {
      if (!state.source) {
        throw new StudioClipsWorkerError({
          code: "MISSING_TRANSCRIPTION_SOURCE",
          kind: "permanent",
          publicMessage: "The transcription source is missing.",
        });
      }
      const audioPath = await input.createTranscriptionAudio(
        state.source.localPath,
        workspace.path,
      );
      return input.heartbeat.run({
        checkpoint: "media_validated",
        code: "media_validated",
        operation: () => input.transcription.transcribe({ audioPath }),
      });
    },
  };
}
