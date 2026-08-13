import { describe, expect, it } from "vitest";
import { createStudioReelWorkerJsonResponse } from "./createStudioReelWorkerJsonResponse";

describe("createStudioReelWorkerJsonResponse", () => {
  it("marks private worker claims and checkpoints no-store", async () => {
    const response = createStudioReelWorkerJsonResponse(
      { claim: { runId: "run_1" } },
      { status: 201 },
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({ claim: { runId: "run_1" } });
  });
});
