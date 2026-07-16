import { getFunctionName } from "convex/server";
import { describe, expect, it } from "vitest";
import { providerWorkerQueueApiReference } from "./providerWorkerQueueApiReference";

describe("providerWorkerQueueApiReference", () => {
  it("targets the nested Convex worker queue mutation", () => {
    expect(getFunctionName(providerWorkerQueueApiReference)).toBe(
      "workerQueue/claimNextWorkerQueueEntry:claimNextWorkerQueueEntry",
    );
  });
});
