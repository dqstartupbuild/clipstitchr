import { STUDIO_CLIPS_CLAIM_SCHEMA_VERSION } from "../constants/studioClipsContractVersion";
import type { StudioClipsInitialClaimEnvelope } from "../contracts/StudioClipsInitialClaimEnvelope";
import type { StudioClipsClaimOptions } from "../contracts/StudioClipsClaimOptions";
import type { StudioClipsClaimSource } from "../contracts/StudioClipsClaimSource";

type StudioClipsTestClaimOverrides = Partial<
  Omit<StudioClipsInitialClaimEnvelope, "options" | "source">
> & {
  options?: Partial<StudioClipsClaimOptions>;
  source?: StudioClipsClaimSource;
};

export function createStudioClipsTestClaim(
  overrides: StudioClipsTestClaimOverrides = {},
): StudioClipsInitialClaimEnvelope {
  return {
    attempt: 1,
    leaseId: "lease_123",
    mode: "initial",
    ownerId: "user_123",
    productId: "product_123",
    requestedAt: "2026-08-12T12:00:00.000Z",
    schemaVersion: STUDIO_CLIPS_CLAIM_SCHEMA_VERSION,
    taskId: "task_123",
    ...overrides,
    options: {
      addSubtitles: true,
      includeBroll: false,
      outputFormat: "vertical",
      ...overrides.options,
    },
    source: overrides.source ?? {
      kind: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
  };
}
