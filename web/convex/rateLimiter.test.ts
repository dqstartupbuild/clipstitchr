import { describe, expect, it } from "vitest";
import { SWIPR_PEXELS_IMPORT_LIMIT } from "../lib/clipstitchr/constants/swiprPexelsImportLimit";
import { rateLimiter } from "./rateLimiter";

describe("Pexels import rate-limit configuration", () => {
  it("fits the largest supported import inside one global shard", () => {
    const config = rateLimiter.limits?.pexelsImportImagesGlobal;

    expect(config).toBeDefined();
    expect(config?.capacity).toBe(500);
    expect(config?.shards).toBe(4);
    expect((config?.capacity ?? 0) / (config?.shards ?? 1)).toBeGreaterThanOrEqual(
      SWIPR_PEXELS_IMPORT_LIMIT,
    );
  });
});
