import { describe, expect, it } from "vitest";
import { createStitchrBatchRunId } from "./stitchrBatchRunId";

describe("createStitchrBatchRunId", () => {
  it("gives separate same-day batch requests separate run IDs", () => {
    const firstRunId = createStitchrBatchRunId(
      "user_123",
      "2026-07-19",
      "product_1",
      "run_1",
    );
    const secondRunId = createStitchrBatchRunId(
      "user_123",
      "2026-07-19",
      "product_1",
      "run_2",
    );

    expect(firstRunId).not.toBe(secondRunId);
    expect(firstRunId).toBe(
      "stitchr-batch:user_123:product_1:2026-07-19:run_1",
    );
  });
});
