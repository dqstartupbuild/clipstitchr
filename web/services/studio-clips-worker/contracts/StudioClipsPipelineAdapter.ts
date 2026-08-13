import type { StudioClipsAnalysisArtifact } from "./StudioClipsAnalysisArtifact";
import type { StudioClipsBrollArtifact } from "./StudioClipsBrollArtifact";
import type { StudioClipsInitialClaimEnvelope } from "./StudioClipsInitialClaimEnvelope";
import type { StudioClipsInputPreflight } from "./StudioClipsInputPreflight";
import type { StudioClipsMediaProbe } from "./StudioClipsMediaProbe";
import type { StudioClipsPipelineState } from "./StudioClipsPipelineState";
import type { StudioClipsRenderArtifact } from "./StudioClipsRenderArtifact";
import type { StudioClipsSourceArtifact } from "./StudioClipsSourceArtifact";
import type { StudioClipsTranscriptArtifact } from "./StudioClipsTranscriptArtifact";
import type { StudioClipsWorkspace } from "./StudioClipsWorkspace";
import type { StudioClipsYouTubeNavigationPolicy } from "./StudioClipsYouTubeNavigationPolicy";

export type StudioClipsPipelineAdapter = {
  acquireSource: (input: {
    claim: StudioClipsInitialClaimEnvelope;
    preflight: StudioClipsInputPreflight;
    workspace: StudioClipsWorkspace;
    youtubePolicy: StudioClipsYouTubeNavigationPolicy;
  }) => Promise<StudioClipsSourceArtifact>;
  analyze: (input: {
    claim: StudioClipsInitialClaimEnvelope;
    state: StudioClipsPipelineState;
    workspace: StudioClipsWorkspace;
  }) => Promise<StudioClipsAnalysisArtifact>;
  fetchBroll: (input: {
    claim: StudioClipsInitialClaimEnvelope;
    state: StudioClipsPipelineState;
    workspace: StudioClipsWorkspace;
  }) => Promise<StudioClipsBrollArtifact[]>;
  preflightSource: (input: {
    claim: StudioClipsInitialClaimEnvelope;
    youtubePolicy: StudioClipsYouTubeNavigationPolicy;
  }) => Promise<StudioClipsInputPreflight>;
  probeMedia: (input: {
    claim: StudioClipsInitialClaimEnvelope;
    localPath: string;
    workspace: StudioClipsWorkspace;
  }) => Promise<StudioClipsMediaProbe>;
  render: (input: {
    claim: StudioClipsInitialClaimEnvelope;
    state: StudioClipsPipelineState;
    workspace: StudioClipsWorkspace;
  }) => Promise<StudioClipsRenderArtifact[]>;
  transcribe: (input: {
    claim: StudioClipsInitialClaimEnvelope;
    state: StudioClipsPipelineState;
    workspace: StudioClipsWorkspace;
  }) => Promise<StudioClipsTranscriptArtifact>;
};
