import type { StudioClipsAccessGateway } from "./StudioClipsAccessGateway";
import type { StudioClipsCancellationGateway } from "./StudioClipsCancellationGateway";
import type { StudioClipsCheckpointStore } from "./StudioClipsCheckpointStore";
import type { StudioClipsClock } from "./StudioClipsClock";
import type { StudioClipsCostGateGateway } from "./StudioClipsCostGateGateway";
import type { StudioClipsMediaProbe } from "./StudioClipsMediaProbe";
import type { StudioClipsProgressPublisher } from "./StudioClipsProgressPublisher";
import type { StudioClipsR2OutputStore } from "./StudioClipsR2OutputStore";
import type { StudioClipsRenderArtifact } from "./StudioClipsRenderArtifact";
import type { StudioClipsRenderRevisionClaimEnvelope } from "./StudioClipsRenderRevisionClaimEnvelope";
import type { StudioClipsRevisionSourceArtifact } from "./StudioClipsRevisionSourceArtifact";
import type { StudioClipsWorkspace } from "./StudioClipsWorkspace";
import type { StudioClipsWorkspacePolicy } from "./StudioClipsWorkspacePolicy";

export type StudioClipsRenderRevisionDependencies = {
  access: StudioClipsAccessGateway;
  acquireSources: (input: {
    claim: StudioClipsRenderRevisionClaimEnvelope;
    workspace: StudioClipsWorkspace;
  }) => Promise<StudioClipsRevisionSourceArtifact[]>;
  cancellation: StudioClipsCancellationGateway;
  checkpoints: StudioClipsCheckpointStore;
  clock: StudioClipsClock;
  costGate: StudioClipsCostGateGateway;
  output: StudioClipsR2OutputStore;
  probe: (input: {
    claim: StudioClipsRenderRevisionClaimEnvelope;
    localPath: string;
    workspace: StudioClipsWorkspace;
  }) => Promise<StudioClipsMediaProbe>;
  progress: StudioClipsProgressPublisher;
  render: (input: {
    claim: StudioClipsRenderRevisionClaimEnvelope;
    media: StudioClipsMediaProbe[];
    sources: StudioClipsRevisionSourceArtifact[];
    workspacePath: string;
  }) => Promise<StudioClipsRenderArtifact[]>;
  workspace?: StudioClipsWorkspacePolicy;
};
