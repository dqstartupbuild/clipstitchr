import type { ProviderTool } from "./providerWorkerTools";

export const PROVIDER_WORKER_CLAIMABLE_PROVIDER_JOBS = [
  ["manual-swapr", "swapr"],
  ["manual-clipr", "clipr"],
  ["manual-swipr-draft", "swipr"],
  ["avatar-photo-generation", "avatar-photo"],
  ["swipr-background-generation", "swipr"],
  ["swapr-photo-expansion", "swapr"],
  ["upload-video-analysis", "stitchr"],
  ["stitch-score-analysis", "stitchr"],
  ["hook-lab-post-analysis", "stitchr"],
] as const satisfies readonly (readonly [string, ProviderTool])[];
