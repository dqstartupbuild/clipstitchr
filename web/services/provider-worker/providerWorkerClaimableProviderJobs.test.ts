import { describe, expect, it } from "vitest";
import { PROVIDER_WORKER_CLAIMABLE_PROVIDER_JOBS } from "./providerWorkerClaimableProviderJobs";

describe("PROVIDER_WORKER_CLAIMABLE_PROVIDER_JOBS", () => {
  it("routes automated stitch score jobs to Stitchr-capable provider workers", () => {
    expect(PROVIDER_WORKER_CLAIMABLE_PROVIDER_JOBS).toContainEqual([
      "stitch-score-analysis",
      "stitchr",
    ]);
  });

  it("routes both Hook Lab stages to Stitchr-capable provider workers", () => {
    expect(PROVIDER_WORKER_CLAIMABLE_PROVIDER_JOBS).toContainEqual([
      "hook-lab-idea-analysis",
      "stitchr",
    ]);
    expect(PROVIDER_WORKER_CLAIMABLE_PROVIDER_JOBS).toContainEqual([
      "hook-lab-idea-use",
      "stitchr",
    ]);
  });
});
