import type { StudioClipsAccessGateway } from "./StudioClipsAccessGateway";
import type { StudioClipsCancellationGateway } from "./StudioClipsCancellationGateway";
import type { StudioClipsCheckpointStore } from "./StudioClipsCheckpointStore";
import type { StudioClipsClock } from "./StudioClipsClock";
import type { StudioClipsCostGateGateway } from "./StudioClipsCostGateGateway";
import type { StudioClipsPipelineAdapter } from "./StudioClipsPipelineAdapter";
import type { StudioClipsProgressPublisher } from "./StudioClipsProgressPublisher";
import type { StudioClipsR2OutputStore } from "./StudioClipsR2OutputStore";
import type { StudioClipsWorkspacePolicy } from "./StudioClipsWorkspacePolicy";

export type StudioClipsWorkerDependencies = {
  access: StudioClipsAccessGateway;
  cancellation: StudioClipsCancellationGateway;
  checkpoints: StudioClipsCheckpointStore;
  clock: StudioClipsClock;
  costGate: StudioClipsCostGateGateway;
  output: StudioClipsR2OutputStore;
  pipeline: StudioClipsPipelineAdapter;
  progress: StudioClipsProgressPublisher;
  workspace?: StudioClipsWorkspacePolicy;
};
