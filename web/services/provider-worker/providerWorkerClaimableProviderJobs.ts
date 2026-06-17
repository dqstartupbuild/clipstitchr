import type { ProviderTool } from "./providerWorkerTools";

export const PROVIDER_WORKER_CLAIMABLE_PROVIDER_JOBS = [
  ["manual-swapr", "swapr"],
  ["manual-clipr", "clipr"],
  ["avatar-photo-generation", "avatar-photo"],
  ["upload-video-analysis", "stitchr"],
  ["stitch-score-analysis", "stitchr"],
] as const satisfies readonly (readonly [string, ProviderTool])[];
