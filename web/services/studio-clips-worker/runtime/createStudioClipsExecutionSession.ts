import type { StudioClipsInitialClaimEnvelope } from "../contracts/StudioClipsInitialClaimEnvelope";
import { createStudioClipsAnalysisProvider } from "../adapters/analysis/createStudioClipsAnalysisProvider";
import { createStudioClipsPexelsBrollProvider } from "../adapters/broll/createStudioClipsPexelsBrollProvider";
import { createStudioClipsAccessGateway } from "../adapters/http/createStudioClipsAccessGateway";
import { createStudioClipsCancellationGateway } from "../adapters/http/createStudioClipsCancellationGateway";
import { createStudioClipsCostGateGateway } from "../adapters/http/createStudioClipsCostGateGateway";
import { createStudioClipsProgressPublisher } from "../adapters/http/createStudioClipsProgressPublisher";
import type { StudioClipsWorkerHttpClient } from "../adapters/http/StudioClipsWorkerHttpClient";
import { createStudioClipsMediaProbe } from "../adapters/media/createStudioClipsMediaProbe";
import { createStudioClipsPipelineAdapter } from "../adapters/pipeline/createStudioClipsPipelineAdapter";
import { runBoundedStudioClipsCommand } from "../adapters/process/runBoundedStudioClipsCommand";
import { createStudioClipsAssemblyAiProvider } from "../adapters/providers/createStudioClipsAssemblyAiProvider";
import { createStudioClipsTranscriptionAudio } from "../adapters/providers/createStudioClipsTranscriptionAudio";
import { createStudioClipsCheckpointStore } from "../adapters/r2/createStudioClipsCheckpointStore";
import { createStudioClipsOutputStore } from "../adapters/r2/createStudioClipsOutputStore";
import type { StudioClipsR2ObjectStore } from "../adapters/r2/StudioClipsR2ObjectStore";
import { createStudioClipsRenderer } from "../adapters/render/createStudioClipsRenderer";
import { createStudioClipsR2SourceAcquirer } from "../adapters/source/createStudioClipsR2SourceAcquirer";
import { createStudioClipsSourcePreflight } from "../adapters/source/createStudioClipsSourcePreflight";
import { createStudioClipsYouTubeSourceAcquirer } from "../adapters/source/createStudioClipsYouTubeSourceAcquirer";
import type { StudioClipsCommandRunner } from "../adapters/process/StudioClipsCommandRunner";
import type { StudioClipsExecutionSession } from "./StudioClipsExecutionSession";
import type { StudioClipsWorkerRuntimeConfig } from "./StudioClipsWorkerRuntimeConfig";
import { createStudioClipsCompletionEvidence } from "./createStudioClipsCompletionEvidence";
import { createStudioClipsLeaseHeartbeat } from "./createStudioClipsLeaseHeartbeat";

export function createStudioClipsExecutionSession(input: {
  claim: StudioClipsInitialClaimEnvelope;
  config: StudioClipsWorkerRuntimeConfig;
  fetch?: typeof fetch;
  http: StudioClipsWorkerHttpClient;
  objects: StudioClipsR2ObjectStore;
  runner?: StudioClipsCommandRunner;
}): StudioClipsExecutionSession {
  const evidence = createStudioClipsCompletionEvidence();
  const runner = input.runner ?? runBoundedStudioClipsCommand;
  const probe = createStudioClipsMediaProbe({
    evidence,
    ffprobePath: input.config.commands.ffprobePath,
    runner,
  });
  const heartbeat = createStudioClipsLeaseHeartbeat({
    claim: input.claim,
    http: input.http,
    intervalMs: Math.max(15_000, Math.min(120_000, input.config.leaseSeconds * 333)),
  });
  const pipeline = createStudioClipsPipelineAdapter({
    acquireR2: createStudioClipsR2SourceAcquirer(input.objects),
    acquireYouTube: createStudioClipsYouTubeSourceAcquirer({
      runner,
      ytDlpPath: input.config.commands.ytDlpPath,
    }),
    analysis: createStudioClipsAnalysisProvider({
      config: input.config.analysis,
      fetch: input.fetch,
    }),
    broll: createStudioClipsPexelsBrollProvider({
      config: input.config.broll,
      fetch: input.fetch,
    }),
    createTranscriptionAudio: createStudioClipsTranscriptionAudio({
      ffmpegPath: input.config.commands.ffmpegPath,
      runner,
    }),
    evidence,
    heartbeat,
    preflight: createStudioClipsSourcePreflight(),
    probe,
    render: createStudioClipsRenderer({
      builtInFontsDirectory: input.config.commands.builtInFontsDirectory,
      evidence,
      ffmpegPath: input.config.commands.ffmpegPath,
      objects: input.objects,
      runner,
    }),
    transcription: createStudioClipsAssemblyAiProvider({
      config: input.config.assemblyAi,
      fetch: input.fetch,
    }),
  });

  return {
    dependencies: {
      access: createStudioClipsAccessGateway(input.http, input.claim),
      cancellation: createStudioClipsCancellationGateway(input.http, input.claim),
      checkpoints: createStudioClipsCheckpointStore({
        evidence,
        heartbeat,
        http: input.http,
        objects: input.objects,
        startingRevision: input.claim.resume?.revision ?? 0,
      }),
      clock: { nowIso: () => new Date().toISOString() },
      costGate: createStudioClipsCostGateGateway(input.http, input.claim),
      output: createStudioClipsOutputStore({
        evidence,
        heartbeat,
        objects: input.objects,
      }),
      pipeline,
      progress: createStudioClipsProgressPublisher(input.http, input.claim),
      ...(input.config.scratchRoot
        ? { workspace: { rootPath: input.config.scratchRoot } }
        : {}),
    },
    evidence,
  };
}
