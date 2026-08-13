import type { StudioClipsClaimEnvelope } from "./StudioClipsClaimEnvelope";
import type { StudioClipsDurableOutput } from "./StudioClipsDurableOutput";
import type { StudioClipsOutputTarget } from "./StudioClipsOutputTarget";

export type StudioClipsR2OutputStore = {
  store: (input: {
    claim: StudioClipsClaimEnvelope;
    targets: StudioClipsOutputTarget[];
  }) => Promise<StudioClipsDurableOutput[]>;
};
