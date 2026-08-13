import type { StudioClipsRenderRevisionClaimEnvelope } from "../contracts/StudioClipsRenderRevisionClaimEnvelope";
import { createStudioClipsAccessGateway } from "../adapters/http/createStudioClipsAccessGateway";
import { createStudioClipsCancellationGateway } from "../adapters/http/createStudioClipsCancellationGateway";
import { createStudioClipsCostGateGateway } from "../adapters/http/createStudioClipsCostGateGateway";
import { createStudioClipsProgressPublisher } from "../adapters/http/createStudioClipsProgressPublisher";
import type { StudioClipsWorkerHttpClient } from "../adapters/http/StudioClipsWorkerHttpClient";
import { createStudioClipsMediaProbe } from "../adapters/media/createStudioClipsMediaProbe";
import { runBoundedStudioClipsCommand } from "../adapters/process/runBoundedStudioClipsCommand";
import type { StudioClipsCommandRunner } from "../adapters/process/StudioClipsCommandRunner";
import { createStudioClipsCheckpointStore } from "../adapters/r2/createStudioClipsCheckpointStore";
import { createStudioClipsOutputStore } from "../adapters/r2/createStudioClipsOutputStore";
import type { StudioClipsR2ObjectStore } from "../adapters/r2/StudioClipsR2ObjectStore";
import { createStudioClipsRevisionRenderer } from "../adapters/render/createStudioClipsRevisionRenderer";
import { acquireStudioClipsRevisionSources } from "../adapters/source/acquireStudioClipsRevisionSources";
import type { StudioClipsWorkerRuntimeConfig } from "./StudioClipsWorkerRuntimeConfig";
import type { StudioClipsRenderRevisionExecutionSession } from "./StudioClipsRenderRevisionExecutionSession";
import { createStudioClipsCompletionEvidence } from "./createStudioClipsCompletionEvidence";
import { createStudioClipsLeaseHeartbeat } from "./createStudioClipsLeaseHeartbeat";

export function createStudioClipsRenderRevisionExecutionSession(input: {
  claim: StudioClipsRenderRevisionClaimEnvelope;
  config: StudioClipsWorkerRuntimeConfig;
  http: StudioClipsWorkerHttpClient;
  objects: StudioClipsR2ObjectStore;
  runner?: StudioClipsCommandRunner;
}): StudioClipsRenderRevisionExecutionSession {
  const evidence = createStudioClipsCompletionEvidence();
  const runner = input.runner ?? runBoundedStudioClipsCommand;
  const heartbeat = createStudioClipsLeaseHeartbeat({
    claim: input.claim,
    http: input.http,
    intervalMs: Math.max(15_000, Math.min(120_000, input.config.leaseSeconds * 333)),
  });
  const probe = createStudioClipsMediaProbe({
    evidence,
    ffprobePath: input.config.commands.ffprobePath,
    runner,
  });
  return {
    dependencies: {
      access: createStudioClipsAccessGateway(input.http, input.claim),
      acquireSources: async ({ claim, workspace }) =>
        await acquireStudioClipsRevisionSources({
          claim,
          objects: input.objects,
          workspacePath: workspace.path,
        }),
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
      probe: async ({ localPath, workspace }) =>
        await probe(localPath, workspace.path),
      progress: createStudioClipsProgressPublisher(input.http, input.claim),
      render: createStudioClipsRevisionRenderer({
        builtInFontsDirectory: input.config.commands.builtInFontsDirectory,
        evidence,
        ffmpegPath: input.config.commands.ffmpegPath,
        objects: input.objects,
        runner,
      }),
      ...(input.config.scratchRoot
        ? { workspace: { rootPath: input.config.scratchRoot } }
        : {}),
    },
    evidence,
  };
}
